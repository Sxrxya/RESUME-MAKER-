/**
 * Dual Validation Engine & Page Budget Calculator for Flexible Mode.
 * 
 * Enforces:
 * 1. Personal details are mandatory
 * 2. Summary is mandatory with MINIMUM 150 characters threshold
 * 3. Education: at least 2 entries mandatory, 1 optional (max 3)
 * 4. Projects: at least 1 mandatory, up to 3 total allowed (1 mandatory + max 2 optional)
 * 5. Professional experience: 100% optional (0 to 3 entries)
 * 6. Line volume & vertical budget calculation (warns when exceeding 1 A4 page & highlights section to trim)
 * 7. 80% completion check for PDF download button activation
 */

import { FLEXIBLE_LIMITS } from '../constants/flexibleLimits';

const TOTAL_A4_POINTS = 720; // usable vertical space on single A4 at standard print margins
const CHARS_PER_LINE = 110;  // average characters per line at ~10pt font in standard body column

/**
 * Estimates the vertical height (in points) of a text block given characters per line.
 */
function estimateTextHeight(text, linePitch = 13) {
  if (!text || !text.trim()) return 0;
  const lines = Math.ceil(text.trim().length / CHARS_PER_LINE) || 1;
  return lines * linePitch;
}

/**
 * Run comprehensive validation on flexible resume data.
 */
export function validateFlexibleResume(data) {
  const errors = [];
  const warnings = [];
  const sectionBreakdown = {};

  // 1. Personal Info Validation (MANDATORY)
  const personal = data.personal || {};
  let personalPoints = 46; // Base header height (name + contact line)
  if (!personal.first_name?.trim()) {
    errors.push({ field: 'first_name', section: 'personal', message: 'First name is required.' });
  }
  if (!personal.last_name?.trim()) {
    errors.push({ field: 'last_name', section: 'personal', message: 'Last name is required.' });
  }
  if (!personal.email?.trim()) {
    errors.push({ field: 'email', section: 'personal', message: 'Email address is required.' });
  } else if (!/\S+@\S+\.\S+/.test(personal.email.trim())) {
    errors.push({ field: 'email', section: 'personal', message: 'Please enter a valid email address.' });
  }
  if (!personal.phone?.trim()) {
    errors.push({ field: 'phone', section: 'personal', message: 'Phone number is required.' });
  }
  if (!personal.city_state?.trim()) {
    errors.push({ field: 'city_state', section: 'personal', message: 'Location (City, State / Country) is required.' });
  }
  sectionBreakdown.personal = { points: personalPoints, label: 'Header & Contact' };

  // 2. Professional Summary (MANDATORY: Minimum 150 chars)
  const summary = data.summary?.trim() || '';
  let summaryPoints = 20; // Section heading
  if (!summary) {
    errors.push({ field: 'summary', section: 'summary', message: 'Professional Summary is required.' });
  } else if (summary.length < FLEXIBLE_LIMITS.summaryMinChars) {
    errors.push({
      field: 'summary',
      section: 'summary',
      message: `Professional Summary must be at least ${FLEXIBLE_LIMITS.summaryMinChars} characters (currently ${summary.length} chars). A substantial summary maintains professional standards.`
    });
  } else if (summary.length > FLEXIBLE_LIMITS.summaryMaxChars) {
    warnings.push({
      field: 'summary',
      section: 'summary',
      message: `Summary is quite long (${summary.length} chars). Consider condensing to prevent page overflow.`
    });
  }
  summaryPoints += estimateTextHeight(summary, 14);
  sectionBreakdown.summary = { points: summaryPoints, label: 'Professional Summary' };

  // 3. Education (2 MANDATORY, 1 OPTIONAL, MAX 3)
  const education = Array.isArray(data.education) ? data.education : [];
  let educationPoints = 22; // Section heading
  let validEduCount = 0;

  education.forEach((edu, index) => {
    const entryNum = index + 1;
    const isRequired = entryNum <= 2;
    const hasAnyField = Boolean(
      edu.institution?.trim() ||
      edu.degree?.trim() ||
      edu.grad_date?.trim() ||
      edu.location?.trim()
    );

    if (isRequired) {
      if (!edu.institution?.trim()) {
        errors.push({ field: `edu_${entryNum}_institution`, section: 'education', message: `Education #${entryNum}: School / College name is required.` });
      }
      if (!edu.degree?.trim()) {
        errors.push({ field: `edu_${entryNum}_degree`, section: 'education', message: `Education #${entryNum}: Degree / Certificate name is required.` });
      }
      if (!edu.grad_date?.trim()) {
        errors.push({ field: `edu_${entryNum}_date`, section: 'education', message: `Education #${entryNum}: Graduation / Completion year is required.` });
      }
      if (edu.institution?.trim() && edu.degree?.trim()) {
        validEduCount++;
      }
    } else if (hasAnyField) {
      if (!edu.institution?.trim() || !edu.degree?.trim()) {
        errors.push({ field: `edu_${entryNum}_incomplete`, section: 'education', message: `Education #${entryNum}: Please complete the school and degree, or remove this entry.` });
      } else {
        validEduCount++;
      }
    }

    if (hasAnyField || isRequired) {
      educationPoints += 32; // Title line + date/degree
      if (edu.highlights?.trim()) {
        educationPoints += estimateTextHeight(edu.highlights, 12);
      }
    }
  });

  if (validEduCount < 2) {
    errors.push({
      field: 'education_count',
      section: 'education',
      message: `At least 2 Education entries are required (e.g. Undergrad Degree + 12th / High School). Currently completed: ${validEduCount}.`
    });
  }
  sectionBreakdown.education = { points: educationPoints, label: 'Education' };

  // 4. Projects (1 MANDATORY, MAX 3)
  const projects = Array.isArray(data.projects) ? data.projects : [];
  let projectsPoints = 22; // Section heading
  let validProjectCount = 0;

  projects.forEach((proj, index) => {
    const projNum = index + 1;
    const isRequired = projNum === 1;
    const hasAny = Boolean(
      proj.title?.trim() ||
      proj.tech_stack?.trim() ||
      proj.bullet_1?.trim() ||
      proj.bullet_2?.trim()
    );

    if (isRequired) {
      if (!proj.title?.trim()) {
        errors.push({ field: `proj_${projNum}_title`, section: 'projects', message: 'Project #1: Project title is required.' });
      }
      if (!proj.bullet_1?.trim()) {
        errors.push({ field: `proj_${projNum}_bullet_1`, section: 'projects', message: 'Project #1: At least one descriptive bullet point is required.' });
      }
      if (proj.title?.trim() && proj.bullet_1?.trim()) {
        validProjectCount++;
      }
    } else if (hasAny) {
      if (!proj.title?.trim() || !proj.bullet_1?.trim()) {
        errors.push({ field: `proj_${projNum}_incomplete`, section: 'projects', message: `Project #${projNum}: Please provide title and at least one bullet, or remove this project.` });
      } else {
        validProjectCount++;
      }
    }

    if (hasAny || isRequired) {
      projectsPoints += 20; // Title & tech stack header
      if (proj.bullet_1?.trim()) projectsPoints += estimateTextHeight(proj.bullet_1, 13) + 4;
      if (proj.bullet_2?.trim()) projectsPoints += estimateTextHeight(proj.bullet_2, 13) + 4;
    }
  });

  if (validProjectCount < 1) {
    errors.push({ field: 'projects_count', section: 'projects', message: 'At least 1 project is required.' });
  }
  sectionBreakdown.projects = { points: projectsPoints, label: 'Projects' };

  // 5. Skills Section
  const skills = data.skills || {};
  let skillsPoints = 22; // Section heading
  let hasSkills = Boolean(
    skills.languages?.trim() ||
    skills.frameworks?.trim() ||
    skills.tools_cloud?.trim() ||
    skills.concepts?.trim()
  );
  if (skills.languages?.trim()) skillsPoints += 14;
  if (skills.frameworks?.trim()) skillsPoints += 14;
  if (skills.tools_cloud?.trim()) skillsPoints += 14;
  if (skills.concepts?.trim()) skillsPoints += 14;
  sectionBreakdown.skills = { points: skillsPoints, label: 'Skills' };

  // 6. Professional Experience (100% OPTIONAL: 0 to 3 entries)
  const experience = Array.isArray(data.experience) ? data.experience : [];
  let experiencePoints = 0;
  let activeExpCount = 0;

  if (experience.length > 0) {
    experiencePoints = 22; // Section heading only if experience exists
    experience.forEach((exp, index) => {
      const expNum = index + 1;
      const hasAny = Boolean(
        exp.company?.trim() ||
        exp.role?.trim() ||
        exp.bullet_1?.trim()
      );
      if (hasAny) {
        if (!exp.company?.trim()) {
          errors.push({ field: `exp_${expNum}_company`, section: 'experience', message: `Experience #${expNum}: Company name is required.` });
        }
        if (!exp.role?.trim()) {
          errors.push({ field: `exp_${expNum}_role`, section: 'experience', message: `Experience #${expNum}: Job title / Role is required.` });
        }
        experiencePoints += 20; // Company & Role line
        if (exp.bullet_1?.trim()) experiencePoints += estimateTextHeight(exp.bullet_1, 13) + 4;
        if (exp.bullet_2?.trim()) experiencePoints += estimateTextHeight(exp.bullet_2, 13) + 4;
        if (exp.bullet_3?.trim()) experiencePoints += estimateTextHeight(exp.bullet_3, 13) + 4;
        activeExpCount++;
      }
    });
    // If all entries were blank, reset points to 0
    if (activeExpCount === 0) {
      experiencePoints = 0;
    }
  }
  sectionBreakdown.experience = { points: experiencePoints, label: 'Work Experience' };

  // 7. Certifications / Honors (Optional)
  let certPoints = 0;
  if (data.certifications?.trim()) {
    certPoints = 20 + estimateTextHeight(data.certifications, 13);
  }
  sectionBreakdown.certifications = { points: certPoints, label: 'Certifications' };

  // 8. Custom Section (Optional with 2 subheads & bullets)
  const custom = data.custom_section || {};
  let customPoints = 0;
  if (custom.title?.trim()) {
    customPoints += 22; // section header
    if (custom.subhead_1?.title?.trim()) {
      customPoints += 18;
      if (custom.subhead_1.bullet_1?.trim()) customPoints += estimateTextHeight(custom.subhead_1.bullet_1, 13) + 4;
      if (custom.subhead_1.bullet_2?.trim()) customPoints += estimateTextHeight(custom.subhead_1.bullet_2, 13) + 4;
    }
    if (custom.subhead_2?.title?.trim()) {
      customPoints += 18;
      if (custom.subhead_2.bullet_1?.trim()) customPoints += estimateTextHeight(custom.subhead_2.bullet_1, 13) + 4;
      if (custom.subhead_2.bullet_2?.trim()) customPoints += estimateTextHeight(custom.subhead_2.bullet_2, 13) + 4;
    }
  }
  sectionBreakdown.custom_section = { points: customPoints, label: custom.title || 'Custom Section' };

  // Calculate Total Vertical Budget Points
  const totalUsedPoints = Object.values(sectionBreakdown).reduce((sum, sec) => sum + sec.points, 0);
  const capacityPercent = Math.round((totalUsedPoints / TOTAL_A4_POINTS) * 100);

  // Density mode determination
  let densityMode = 'balanced';
  if (capacityPercent < 70) {
    densityMode = 'spacious';
  } else if (capacityPercent <= 92) {
    densityMode = 'balanced';
  } else if (capacityPercent <= 100) {
    densityMode = 'compact';
  } else {
    densityMode = 'overflow';
  }

  // Page Overflow Warning and actionable trim recommendations
  let trimAdvice = null;
  if (capacityPercent > 100) {
    const excessPoints = totalUsedPoints - TOTAL_A4_POINTS;
    const excessLines = Math.ceil(excessPoints / 13);

    // Find the largest consuming section among Projects, Experience, and Summary
    const candidates = [
      { key: 'projects', ...sectionBreakdown.projects },
      { key: 'experience', ...sectionBreakdown.experience },
      { key: 'summary', ...sectionBreakdown.summary },
    ].sort((a, b) => b.points - a.points);

    const largest = candidates[0];
    trimAdvice = {
      excessLines,
      targetSection: largest.key,
      targetLabel: largest.label,
      suggestion: largest.key === 'projects'
        ? `Projects takes ${Math.round((largest.points / totalUsedPoints) * 100)}% of your page. Trim 1-2 bullet points or shorten descriptions to fit on 1 page.`
        : largest.key === 'experience'
        ? `Experience takes ${Math.round((largest.points / totalUsedPoints) * 100)}% of your page. Condense bullet points to fit on 1 page.`
        : `Summary is using substantial space. Shorten by ~${excessLines * CHARS_PER_LINE} characters.`
    };

    warnings.push({
      field: 'page_overflow',
      section: 'layout',
      message: `⚠️ Single Page Budget Exceeded (~${excessLines} line${excessLines > 1 ? 's' : ''} over). ${trimAdvice.suggestion}`
    });
  }

  // Completion Percentage Engine (0% - 100%)
  let score = 0;
  // Personal (20%)
  if (personal.first_name?.trim() && personal.last_name?.trim() && personal.email?.trim() && personal.phone?.trim() && personal.city_state?.trim()) {
    score += 20;
  } else {
    const filledFields = ['first_name', 'last_name', 'email', 'phone', 'city_state'].filter(f => personal[f]?.trim()).length;
    score += Math.round((filledFields / 5) * 20);
  }

  // Summary (20%)
  if (summary.length >= FLEXIBLE_LIMITS.summaryMinChars) {
    score += 20;
  } else if (summary.length > 0) {
    score += Math.round((summary.length / FLEXIBLE_LIMITS.summaryMinChars) * 15);
  }

  // Education (25%)
  if (validEduCount >= 2) {
    score += 25;
  } else if (validEduCount === 1) {
    score += 12;
  }

  // Projects (20%)
  if (validProjectCount >= 1) {
    score += 20;
  }

  // Skills (10%)
  if (hasSkills) {
    score += 10;
  }

  // Experience / Bonus (5%)
  if (activeExpCount > 0 || data.certifications?.trim()) {
    score += 5;
  } else if (score >= 95) {
    score = 100; // Freshers with great projects & skills can reach 100% without experience!
  }

  const progressPercent = Math.min(100, score);

  // Intelligent Production-Grade Page-Fill Advisor
  // When resume capacity is under 85%, diagnose content deficits and give specific, actionable advice to fill 1 A4 page naturally
  const recommendations = [];
  if (capacityPercent < 85) {
    // 1. Check Projects for missing 2nd bullet or 2nd project
    const p1 = projects[0] || {};
    if (validProjectCount >= 1 && (!p1.bullet_2 || !p1.bullet_2.trim())) {
      recommendations.push({
        section: 'projects',
        tab: 'projects',
        title: 'Add 2nd bullet to Project #1',
        impact: '+8% Page Fill',
        message: 'Project #1 has only 1 bullet point. Add another bullet point describing your architecture, metrics, or results.'
      });
    }
    if (projects.length < 2 || !projects[1]?.title?.trim()) {
      recommendations.push({
        section: 'projects',
        tab: 'projects',
        title: 'Add a 2nd Technical or Academic Project',
        impact: '+15% Page Fill',
        message: 'Adding a 2nd project showcases your breadth of experience and fills the remaining page space cleanly.'
      });
    }

    // 2. Check Skills matrix categories
    const emptySkillCategories = [];
    if (!skills.concepts?.trim()) emptySkillCategories.push('Core Competencies');
    if (!skills.tools_cloud?.trim()) emptySkillCategories.push('Tools & Software');
    if (!skills.languages?.trim()) emptySkillCategories.push('Languages & Tech');
    if (!skills.frameworks?.trim()) emptySkillCategories.push('Domain Knowledge');

    if (emptySkillCategories.length > 0) {
      recommendations.push({
        section: 'skills',
        tab: 'skills',
        title: `Complete Skills Matrix (${emptySkillCategories.slice(0, 2).join(', ')})`,
        impact: `+${Math.min(16, emptySkillCategories.length * 4)}% Page Fill`,
        message: `You have unfilled skill categories (${emptySkillCategories.join(', ')}). Filling them provides a rich, balanced matrix.`
      });
    }

    // 3. Check Education coursework / highlights
    const needsEduHighlights = education.some((e, i) => i < 2 && (!e.highlights || !e.highlights.trim()));
    if (needsEduHighlights) {
      recommendations.push({
        section: 'education',
        tab: 'education',
        title: 'Add Coursework or Academic Honors to Education',
        impact: '+6% Page Fill',
        message: 'Add relevant coursework, academic distinctions, or capstone details under your degree entries to enrich your academic profile.'
      });
    }

    // 4. Check Custom Section
    if (!custom.title?.trim() || !custom.subhead_1?.title?.trim()) {
      recommendations.push({
        section: 'custom',
        tab: 'custom',
        title: 'Add a Custom Section (Leadership, Awards, or Research)',
        impact: '+16% Page Fill',
        message: 'Create a tailored section with your own custom heading, 2 subheadings, and bullet points to complete your 1-page document.'
      });
    }

    // 5. Check Certifications
    if (!data.certifications?.trim()) {
      recommendations.push({
        section: 'certifications',
        tab: 'certifications',
        title: 'Add Certifications & Honors',
        impact: '+5% Page Fill',
        message: 'List professional credentials (e.g. AWS, Coursera, HackerRank, University Honors) to demonstrate continuous skill development.'
      });
    }

    // 6. Check Summary length
    if (summary.length >= 150 && summary.length < 280) {
      recommendations.push({
        section: 'summary',
        tab: 'summary',
        title: 'Enrich Professional Summary',
        impact: '+5% Page Fill',
        message: `Your summary is concise (${summary.length} chars). Expanding by 1-2 sentences highlighting your domains of expertise will strengthen the opening.`
      });
    }
  }

  // Criteria for enabling PDF Download Button:
  // 1. Completion score must be >= 80%
  // 2. Zero critical errors (mandatory fields satisfied & summary >= 150 chars)
  // 3. Not drastically overflowing (>108% capacity)
  const isEligibleForExport = progressPercent >= 80 && errors.length === 0 && capacityPercent <= 108;
  const canDownloadPdf = isEligibleForExport;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
    progressPercent,
    isEligibleForExport,
    canDownloadPdf,
    budget: {
      usedPoints: totalUsedPoints,
      totalPoints: TOTAL_A4_POINTS,
      capacityPercent,
      densityMode,
      trimAdvice,
      recommendations,
      sectionBreakdown
    }
  };
}
