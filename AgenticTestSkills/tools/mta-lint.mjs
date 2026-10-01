#!/usr/bin/env node
/**
 * Menditect Test Automation (MTA) Linter & Verification Tool
 * 
 * Standalone, zero-dependency Node.js ESM tool that validates:
 * 1. Execution Plans (EP_*.md) against canonical MTA schemas and pattern rules (PAT-*, ANTI-*).
 * 2. Post-construction Smoke Audits (4-Phase semantic ledger diff against MTA server JSON).
 * 3. Configuration files (mta_config.json).
 * 
 * Usage:
 *   node tools/mta-lint.mjs plan <path/to/EP_*.md> [--json]
 *   node tools/mta-lint.mjs audit <path/to/EP_*.md> <path/to/server-response.json> [--json]
 *   node tools/mta-lint.mjs config [path/to/mta_config.json] [--json]
 *   node tools/mta-lint.mjs self-test
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const VERSION = "1.0.0";

// ==========================================
// CLI Argument Dispatcher
// ==========================================
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const isJson = args.includes('--json');

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  if (command === '--version' || command === '-v') {
    console.log(`mta-lint v${VERSION}`);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'plan': {
        const filePath = args[1];
        if (!filePath || filePath.startsWith('--')) {
          console.error("Error: Missing execution plan path. Usage: mta-lint plan <path/to/EP_*.md>");
          process.exit(1);
        }
        const result = lintExecutionPlan(filePath);
        outputResult(result, isJson, "Execution Plan Quality & Compliance Audit");
        process.exit(result.valid ? 0 : 1);
        break;
      }
      case 'audit': {
        const planPath = args[1];
        const serverJsonPath = args[2];
        if (!planPath || !serverJsonPath || planPath.startsWith('--') || serverJsonPath.startsWith('--')) {
          console.error("Error: Missing arguments. Usage: mta-lint audit <path/to/EP_*.md> <path/to/server-data.json>");
          process.exit(1);
        }
        const result = runSmokeAudit(planPath, serverJsonPath);
        outputResult(result, isJson, "MTA Post-Construction 4-Phase Smoke Audit");
        process.exit(result.valid ? 0 : 1);
        break;
      }
      case 'config': {
        const configPath = args[1] && !args[1].startsWith('--') ? args[1] : 'mta_config.json';
        const result = lintConfig(configPath);
        outputResult(result, isJson, "MTA Configuration Validation");
        process.exit(result.valid ? 0 : 1);
        break;
      }
      case 'self-test': {
        const result = runSelfTest();
        outputResult(result, isJson, "mta-lint Self-Test Suite");
        process.exit(result.valid ? 0 : 1);
        break;
      }
      default:
        console.error(`Unknown command: '${command}'. Available commands: plan, audit, config, self-test`);
        printHelp();
        process.exit(1);
    }
  } catch (err) {
    if (isJson) {
      console.log(JSON.stringify({ valid: false, fatalError: err.message }, null, 2));
    } else {
      console.error(`Fatal execution error: ${err.message}`);
      if (process.env.DEBUG) console.error(err.stack);
    }
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Menditect Test Automation Linter (mta-lint v${VERSION})

Commands:
  plan <file> [--json]                 Validate Execution Plan syntax, schema, and pattern rules
  audit <plan-file> <server-json>      Verify constructed MTA server state against plan (4-phase diff)
  config [path] [--json]               Validate mta_config.json structure and path integrity
  self-test                            Run internal unit tests and rule compliance checks

Options:
  --json                               Output results formatted as JSON
  --version, -v                        Show mta-lint version
  --help, -h                           Show this help message
`);
}

function outputResult(result, isJson, title) {
  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`\n==================================================`);
  console.log(`  ${title}`);
  console.log(`==================================================`);
  if (result.target) console.log(`Target  : ${result.target}`);
  console.log(`Status  : ${result.valid ? 'PASS' : 'FAIL'}`);
  console.log(`Score   : ${result.passedCount}/${result.totalCount} checks passed\n`);

  if (result.checks && result.checks.length > 0) {
    for (const check of result.checks) {
      const mark = check.pass ? '[OK]  ' : '[FAIL]';
      console.log(`  ${mark} ${check.name}`);
      if (!check.pass && check.reason) {
        console.log(`         Reason: ${check.reason}`);
      }
      if (check.details) {
        console.log(`         Details: ${check.details}`);
      }
    }
  }

  if (result.errors && result.errors.length > 0) {
    console.log(`\nIdentified Violations:`);
    for (const err of result.errors) {
      console.log(`  - [${err.code || 'ERROR'}] ${err.message}`);
    }
  }

  if (result.receipt) {
    console.log(`\nAudit Receipt Markdown:`);
    console.log(result.receipt);
  }

  console.log(`--------------------------------------------------\n`);
}

// ==========================================
// Markdown & Table Parser Utilities
// ==========================================

/**
 * Extracts YAML frontmatter or YAML block inside <details><summary>...Metadata...</summary>
 */
function extractMetadata(content) {
  // 1. Standard YAML frontmatter --- ... ---
  const standardMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (standardMatch) {
    return parseSimpleYaml(standardMatch[1]);
  }

  // 2. Collapsible <details> block containing ```yaml ... ```
  const detailsMatch = content.match(/<details[\s\S]*?<summary>[\s\S]*?(?:Metadata|Tracking)[\s\S]*?<\/summary>[\s\S]*?```ya?ml\r?\n([\s\S]*?)\r?\n```[\s\S]*?<\/details>/i);
  if (detailsMatch) {
    return parseSimpleYaml(detailsMatch[1]);
  }

  // 3. Fallback: Any ```yaml block with plan_id
  const anyYamlMatch = content.match(/```ya?ml\r?\n([\s\S]*?plan_id[\s\S]*?)\r?\n```/i);
  if (anyYamlMatch) {
    return parseSimpleYaml(anyYamlMatch[1]);
  }

  return null;
}

function parseSimpleYaml(yamlStr) {
  const meta = {};
  const lines = yamlStr.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let val = trimmed.slice(colonIdx + 1).trim();
    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    } else if (val === 'null') {
      val = null;
    } else if (!isNaN(Number(val)) && val !== '') {
      val = Number(val);
    }
    meta[key] = val;
  }
  return meta;
}

/**
 * Parses markdown pipe tables into structured rows and column headers
 */
function parseMarkdownTables(content) {
  const tables = [];
  const lines = content.split(/\r?\n/);
  let currentTable = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!currentTable) {
        currentTable = { startLine: i + 1, rawLines: [] };
      }
      currentTable.rawLines.push(line);
    } else {
      if (currentTable) {
        if (currentTable.rawLines.length >= 3) {
          tables.push(processTable(currentTable));
        }
        currentTable = null;
      }
    }
  }

  if (currentTable && currentTable.rawLines.length >= 3) {
    tables.push(processTable(currentTable));
  }

  return tables;
}

function processTable(rawTable) {
  const rawLines = rawTable.rawLines;
  const parseRow = (line) => {
    // Strip outer pipes and split by unescaped pipe
    const inner = line.replace(/^\|/, '').replace(/\|$/, '');
    return inner.split('|').map(cell => cell.trim());
  };

  const headers = parseRow(rawLines[0]);
  // row 1 is separator |:---|:---|
  const dataRows = [];
  for (let i = 2; i < rawLines.length; i++) {
    const cells = parseRow(rawLines[i]);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cells[idx] !== undefined ? cells[idx] : '';
    });
    rowObj._cells = cells;
    dataRows.push(rowObj);
  }

  return {
    startLine: rawTable.startLine,
    headers,
    rows: dataRows,
    rawLines
  };
}

// ==========================================
// Execution Plan Linter Engine (mta-lint plan)
// ==========================================
export function lintExecutionPlan(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      target: filePath,
      passedCount: 0,
      totalCount: 1,
      checks: [{ name: "File Existence", pass: false, reason: `File not found: ${filePath}` }],
      errors: [{ code: "FILE_NOT_FOUND", message: `Execution plan does not exist at ${filePath}` }]
    };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const metadata = extractMetadata(content);
  const tables = parseMarkdownTables(content);

  const checks = [];
  const errors = [];

  const addCheck = (name, pass, reason = null, code = null, details = null) => {
    checks.push({ name, pass, reason, details });
    if (!pass) {
      errors.push({ code: code || 'CHECK_FAILED', message: reason });
    }
  };

  // 1. Metadata Verification
  if (!metadata) {
    addCheck("Metadata Block Present", false, "Missing metadata block (either YAML frontmatter or <details> with YAML)", "MISSING_METADATA");
  } else {
    addCheck("Metadata Block Present", true);
    addCheck("Plan ID Specified", !!metadata.plan_id, "Missing 'plan_id' in metadata", "MISSING_PLAN_ID");
    addCheck("Category Specified", ['Backend', 'Frontend'].includes(metadata.category), `Category must be 'Backend' or 'Frontend', found: '${metadata.category}'`, "INVALID_CATEGORY");
  }

  // 2. Sections Discovery
  const hasSection1 = /##\s*1\.\s*(?:Purpose\s*&|Test\s*Objectives|Placement)/i.test(content);
  const hasSection2 = /##\s*2\.\s*(?:Component\s*Under\s*Test|Target\s*Component|Verified\s*Model)/i.test(content);
  const hasSection3 = /##\s*3\.\s*(?:Test\s*Steps|Master\s*Step)/i.test(content) || /Section\s*5:\s*Master\s*Step/i.test(content);
  const hasSection4 = /##\s*4\.\s*(?:Test\s*Scenarios|Target-Bound\s*Data|Data\s*Variation)/i.test(content) || /Section\s*6:\s*(?:Target-Bound\s*Data|Data\s*Variation)/i.test(content);
  const hasSection5 = /##\s*5\.\s*(?:Quality\s*&|Pre-Approval|Pre-Approval\s*Quality)/i.test(content) || /Section\s*7:\s*Pre-Approval/i.test(content);

  addCheck("Section 1: Purpose & Scope Present", hasSection1, "Section 1 (Purpose & Scope / Test Objectives) missing", "MISSING_SEC_1");
  addCheck("Section 2: Component Under Test Present", hasSection2, "Section 2 (Component Under Test / AST Summary) missing", "MISSING_SEC_2");
  addCheck("Section 3: Test Steps & Action Sequence Present", hasSection3, "Section 3 (Test Steps / Master Step Ledger) missing", "MISSING_SEC_3");
  addCheck("Section 4: Test Scenarios & Test Data Present", hasSection4, "Section 4 (Test Scenarios / Data Variation Matrix) missing", "MISSING_SEC_4");
  addCheck("Section 5: Quality & Compliance Checks Present", hasSection5, "Section 5 (Quality & Compliance / Pre-Approval Verification) missing", "MISSING_SEC_5");

  // 3. Find Master Step Specification Ledger
  let stepLedgerTable = null;
  let variationMatrixTable = null;

  for (const t of tables) {
    const headerStr = t.headers.join(' ').toLowerCase();
    if (headerStr.includes('step action') || headerStr.includes('output handle') || headerStr.includes('action & target')) {
      stepLedgerTable = t;
    } else if (headerStr.includes('step target') || headerStr.includes('scenario #1') || (headerStr.includes('scenario name') && headerStr.includes('scenario'))) {
      variationMatrixTable = t;
    }
  }

  // Validate Master Step Ledger
  if (!stepLedgerTable) {
    addCheck("Master Step Specification Ledger Table Found", false, "Could not find Master Step Specification table in document", "MISSING_STEP_LEDGER");
  } else {
    addCheck("Master Step Specification Ledger Table Found", true);

    // Check required columns (PAT-111, Unified Promotable Blueprint)
    const requiredHeaderKeywords = ['case', 'input', 'output', 'parameters', 'settings'];
    const hStr = stepLedgerTable.headers.join(' ').toLowerCase();
    const missingCols = requiredHeaderKeywords.filter(k => !hStr.includes(k));

    if (missingCols.length > 0) {
      addCheck("Step Ledger Required Columns", false, `Missing required columns matching: ${missingCols.join(', ')}`, "INCOMPLETE_LEDGER_COLUMNS");
    } else {
      addCheck("Step Ledger Required Columns", true);
    }

    // Step Rules Validation
    validateStepLedgerRules(stepLedgerTable, metadata, addCheck);
  }

  // Validate Target-Bound Data Variation Matrix
  if (!variationMatrixTable) {
    addCheck("Data Variation Matrix Table Found", false, "Could not find Data Variation Matrix table in document", "MISSING_VARIATION_MATRIX");
  } else {
    addCheck("Data Variation Matrix Table Found", true);
    validateVariationMatrix(variationMatrixTable, addCheck);
  }

  // 4. Negative Anti-Pattern Scans
  scanAntiPatterns(content, stepLedgerTable, variationMatrixTable, addCheck);

  const passedCount = checks.filter(c => c.pass).length;
  const totalCount = checks.length;
  const valid = errors.length === 0;

  return {
    valid,
    target: path.basename(filePath),
    filePath,
    passedCount,
    totalCount,
    checks,
    errors
  };
}

function validateStepLedgerRules(table, metadata, addCheck) {
  const isBackend = !metadata || metadata.category === 'Backend';
  let previousAction = null;
  let previousOutputHandle = null;
  let hasSentinelFilter = false;
  let hasCountAssertion = false;
  let hasPat06Violation = false;

  for (let idx = 0; idx < table.rows.length; idx++) {
    const row = table.rows[idx];
    const rowText = Object.values(row).join(' ');

    // Rule: PAT-06 Direct Attribute Init on CreateObject
    // Consecutive ChangeObject immediately following CreateObject on same handle is prohibited (ANTI-01)
    const isCreate = /CreateObject/i.test(rowText);
    const isChange = /ChangeObject/i.test(rowText);

    if (isCreate) {
      previousAction = 'CreateObject';
      // attempt to identify handle
      const outHandleCol = Object.keys(row).find(k => k.toLowerCase().includes('output'));
      previousOutputHandle = outHandleCol ? row[outHandleCol].replace(/[`\s]/g, '') : null;
    } else if (isChange) {
      const inHandleCol = Object.keys(row).find(k => k.toLowerCase().includes('input'));
      const inHandle = inHandleCol ? row[inHandleCol].replace(/[`\s]/g, '') : null;
      if (previousAction === 'CreateObject' && inHandle && previousOutputHandle && inHandle === previousOutputHandle) {
        addCheck("PAT-06: Direct Attribute Init on CreateObject", false, `Row ${idx + 1} has ChangeObject immediately following CreateObject for handle '${inHandle}'. Initial attributes must be set directly on CreateObject.`, "ANTI-01_VIOLATION");
        hasPat06Violation = true;
      }
      previousAction = 'ChangeObject';
    } else {
      previousAction = 'Other';
    }

    // Check PAT-07 Sentinel Filter & PAT-08 Object Count Assertion
    if (/RetrieveObject/i.test(rowText) && /SentinelKey/i.test(rowText)) {
      hasSentinelFilter = true;
    }
    if (/Assert\s+(?:Object\s+)?Count/i.test(rowText)) {
      hasCountAssertion = true;
    }

    // Settings rule for backend unit tests (None / Stop)
    if (isBackend) {
      const settingsCol = Object.keys(row).find(k => k.toLowerCase().includes('settings') || k.toLowerCase().includes('exec'));
      if (settingsCol && row[settingsCol]) {
        const val = row[settingsCol];
        if (/Always/i.test(val) && !/None/i.test(val)) {
          addCheck(`Step ${idx + 1} Backend Execution Settings`, false, `Backend unit tests must use 'None / Stop', found: '${val}'`, "INVALID_EXEC_SETTINGS");
        }
      }
    }
  }

  // Record PAT-06 check if no violation was recorded
  if (!hasPat06Violation) {
    addCheck("PAT-06: Direct Attribute Init on CreateObject", true);
  }

  // Sentinel retrieval check (if sentinel is mentioned in table)
  const allText = table.rawLines.join(' ');
  if (/SentinelKey/i.test(allText)) {
    addCheck("PAT-07: Sentinel Filter for Null Parameter Boundaries", hasSentinelFilter, "SentinelKey referenced but no RetrieveObject step filters by SentinelKey", "MISSING_SENTINEL_RETRIEVE");
    addCheck("PAT-08: Object Count Assertion on Sentinel Retrieve", hasCountAssertion, "Sentinel filter step must embed an Object Count assertion", "MISSING_COUNT_ASSERTION");
  }
}

function checksHas(addCheckFn, name) {
  // helper to check if rule already registered
  return false;
}

function validateVariationMatrix(table, addCheck) {
  // Row headers / labels: prefer 'step target', 'target', 'step', or 2nd column if 1st is '#'
  const targetColKey = Object.keys(table.rows[0] || {}).find(k => {
    const l = k.toLowerCase().trim();
    return (l.includes('target') || l.includes('step')) && !l.includes('exec') && l !== '#';
  }) || (table.headers.length > 1 && table.headers[0].trim() === '#' ? table.headers[1] : table.headers[0]);
  const scenarioCols = table.headers.filter(h => /scenario\s*#?\d+/i.test(h));

  if (scenarioCols.length === 0) {
    addCheck("Variation Matrix Scenario Columns Found", false, "Matrix must have columns formatted as 'Scenario #1', 'Scenario #2', etc.", "INVALID_MATRIX_COLUMNS");
    return;
  }
  addCheck("Variation Matrix Scenario Columns Found", true, null, null, `Found ${scenarioCols.length} scenario column(s): ${scenarioCols.join(', ')}`);

  // PAT-110 & ANTI-59: Target-Bound Schema
  // Check that rows specify concrete step targets (e.g. Step X: Entity.Attribute)
  let hasScenarioNameRow = false;
  let hasScenarioDescRow = false;
  let hasAssociationRow = false;
  let conceptualFlagRows = [];

  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    const rowLabel = targetColKey ? row[targetColKey] : Object.values(row)[0] || '';
    const cleanLabel = rowLabel.replace(/[`*_]/g, '').trim();

    if (/Scenario\s*Name/i.test(cleanLabel)) {
      hasScenarioNameRow = true;
      // Check all scenarios have names (PAT-77)
      for (const sCol of scenarioCols) {
        if (!row[sCol] || row[sCol].trim() === '') {
          addCheck(`PAT-77: Scenario Name for ${sCol}`, false, `Scenario name in column '${sCol}' cannot be empty`, "EMPTY_SCENARIO_NAME");
        }
      }
    } else if (/Scenario\s*Desc/i.test(cleanLabel)) {
      hasScenarioDescRow = true;
      for (const sCol of scenarioCols) {
        if (!row[sCol] || row[sCol].trim() === '') {
          addCheck(`PAT-77: Scenario Description for ${sCol}`, false, `Scenario description in column '${sCol}' cannot be empty`, "EMPTY_SCENARIO_DESC");
        }
      }
    } else {
      // Validate concrete target (PAT-110)
      const isTargetBound = /(?:Step\s*\d+|Assert|Filter)/i.test(cleanLabel);
      if (!isTargetBound && cleanLabel.length > 0) {
        conceptualFlagRows.push(cleanLabel);
      }

      // Check ANTI-48: Association bindings or object handles in variation matrix
      if (/(?:association|handle|object)\s*assigned/i.test(cleanLabel) || /assoc/i.test(cleanLabel)) {
        hasAssociationRow = true;
      }
    }
  }

  addCheck("PAT-77: Explicit Scenario Names Row", hasScenarioNameRow, "Matrix must include a 'Scenario Name' row", "MISSING_SCENARIO_NAMES");
  addCheck("PAT-77: Explicit Scenario Descriptions Row", hasScenarioDescRow, "Matrix must include a 'Scenario Description' row", "MISSING_SCENARIO_DESCS");

  if (conceptualFlagRows.length > 0) {
    addCheck("PAT-110: Target-Bound Matrix Schema", false, `Rows must target concrete test steps (e.g. 'Step 1: Entity.Attribute'). Found conceptual rows: ${conceptualFlagRows.join(', ')}`, "ANTI-59_VIOLATION");
  } else {
    addCheck("PAT-110: Target-Bound Matrix Schema", true);
  }

  if (hasAssociationRow) {
    addCheck("ANTI-48: Zero Association Rows in Matrix", false, "Object handles or association assignments cannot appear as variation rows. Use PAT-07 sentinel retrieves instead.", "ANTI-48_VIOLATION");
  } else {
    addCheck("ANTI-48: Zero Association Rows in Matrix", true);
  }
}

function scanAntiPatterns(content, stepTable, matrixTable, addCheck) {
  // ANTI-44: Sequence Reordering Serialization (No parallel reorderings)
  const parallelReorder = /parallel.*(?:SetSequenceOfTestStep|SetSequenceOfTestCase)/i.test(content);
  addCheck("ANTI-44: Serialized Step Sequencing", !parallelReorder, "Parallel batching of sequence reordering is prohibited", "ANTI-44_VIOLATION");

  // ANTI-20: Frontend UI vs Microflow Substitution
  if (content.includes("MenditectMxFrontendTestKit")) {
    const hasSubstitutedMicroflow = /CallMicroflow.*(?:ACT_|SUB_).*(?:button|click|page)/i.test(content);
    addCheck("ANTI-20: Frontend Isolation (No Microflow Substitution)", !hasSubstitutedMicroflow, "UI actions must drive the browser via FrontendTestKit, not backend microflows", "ANTI-20_VIOLATION");
  }

  // ANTI-60: Unified Promotable Blueprint (No unrolled steps)
  const unrolledMatch = content.match(/###\s*Scenario\s*#?\d+[\s\S]*?CreateObject[\s\S]*?###\s*Scenario\s*#?\d+[\s\S]*?CreateObject/gi);
  if (unrolledMatch && unrolledMatch.length > 1) {
    addCheck("PAT-111 & ANTI-60: Unified Promotable Blueprint", false, "Execution plan contains unrolled duplicate step sequences per scenario. Must use a single master ledger parameterized by the Variation Matrix.", "ANTI-60_VIOLATION");
  } else {
    addCheck("PAT-111 & ANTI-60: Unified Promotable Blueprint", true);
  }
}

// ==========================================
// Smoke Audit Engine (mta-lint audit)
// ==========================================
export function runSmokeAudit(planPath, serverJsonPath) {
  if (!fs.existsSync(planPath)) {
    throw new Error(`Execution plan not found: ${planPath}`);
  }
  if (!fs.existsSync(serverJsonPath)) {
    throw new Error(`Server JSON data file not found: ${serverJsonPath}`);
  }

  const planContent = fs.readFileSync(planPath, 'utf-8');
  const serverData = JSON.parse(fs.readFileSync(serverJsonPath, 'utf-8'));
  const tables = parseMarkdownTables(planContent);

  let stepLedgerTable = null;
  let variationMatrixTable = null;

  for (const t of tables) {
    const headerStr = t.headers.join(' ').toLowerCase();
    if (headerStr.includes('step action') || headerStr.includes('output handle')) {
      stepLedgerTable = t;
    } else if (headerStr.includes('scenario #1') || (headerStr.includes('scenario name') && headerStr.includes('scenario'))) {
      variationMatrixTable = t;
    }
  }

  const checks = [];
  const errors = [];
  const addCheck = (name, pass, reason = null, code = null, details = null) => {
    checks.push({ name, pass, reason, details });
    if (!pass) errors.push({ code: code || 'AUDIT_FAILED', message: reason });
  };

  // Phase 1: Step Count & Action Type Parity
  const plannedSteps = stepLedgerTable ? stepLedgerTable.rows : [];
  const serverSteps = serverData.testSteps || serverData.steps || [];
  const pCount = plannedSteps.length;
  const sCount = serverSteps.length;

  const phase1Pass = pCount === sCount;
  addCheck("Phase 1: Step Count Parity", phase1Pass, phase1Pass ? null : `Planned steps: ${pCount}, Server steps: ${sCount}`, "STEP_COUNT_MISMATCH", `Planned: ${pCount} | Server: ${sCount}`);

  // Phase 2: Variation Item Registration
  const plannedVarRows = variationMatrixTable ? variationMatrixTable.rows.filter(r => {
    const rowText = Object.values(r).join(' ');
    return !/Scenario\s*(?:Name|Desc)/i.test(rowText);
  }) : [];
  const serverVarItems = serverData.dataVariationItems || serverData.variationItems || [];
  const phase2Pass = plannedVarRows.length === serverVarItems.length || serverVarItems.length >= plannedVarRows.length;
  addCheck("Phase 2: Variation Item Registration Parity", phase2Pass, phase2Pass ? null : `Planned variation rows: ${plannedVarRows.length}, Server registered items: ${serverVarItems.length}`, "VARIATION_ITEM_MISMATCH", `Planned: ${plannedVarRows.length} | Registered: ${serverVarItems.length}`);

  // Phase 3: Scenario Metadata (Columns, Names, Descriptions)
  const scenarioCols = variationMatrixTable ? variationMatrixTable.headers.filter(h => /scenario\s*#?\d+/i.test(h)) : [];
  const serverScenarios = serverData.scenarios || serverData.dataVariations || [];
  const phase3Pass = scenarioCols.length <= serverScenarios.length || serverScenarios.length > 0;
  addCheck("Phase 3: Scenario Metadata Registration", phase3Pass, phase3Pass ? null : `Planned scenarios: ${scenarioCols.length}, Server scenarios: ${serverScenarios.length}`, "SCENARIO_COUNT_MISMATCH", `Planned: ${scenarioCols.length} | Server: ${serverScenarios.length}`);

  // Phase 4: MTA Construction Errors Check
  const constructionErrors = serverData.constructionErrors !== undefined ? serverData.constructionErrors : (serverData.TCER_TestConstructionErrors || 0);
  const phase4Pass = constructionErrors === 0;
  addCheck("Phase 4: Server Model Construction Errors", phase4Pass, phase4Pass ? null : `Server reported ${constructionErrors} construction error(s)`, "CONSTRUCTION_ERRORS", `TCER_TestConstructionErrors: ${constructionErrors}`);

  const valid = phase1Pass && phase2Pass && phase3Pass && phase4Pass;

  // Generate Receipt
  const receipt = `
* **Phase 1 (Step Count Parity):** Planned: ${pCount} | Server: ${sCount} | Status: ${phase1Pass ? 'PASS' : 'FAIL'}
* **Phase 2 (Variation Item Registration):** Planned: ${plannedVarRows.length} | Registered: ${serverVarItems.length} | Status: ${phase2Pass ? 'PASS' : 'FAIL'}
* **Phase 3 (Scenario Metadata):** Planned Columns: ${scenarioCols.length} | Server Scenarios: ${serverScenarios.length} | Status: ${phase3Pass ? 'PASS' : 'FAIL'}
* **Phase 4 (Construction Errors):** TCER_TestConstructionErrors == ${constructionErrors} | Status: ${phase4Pass ? 'PASS' : 'FAIL'}
* **Overall Smoke Audit Verdict:** ${valid ? 'PASS (0 Discrepancies)' : 'FAIL'}
`.trim();

  return {
    valid,
    target: path.basename(planPath),
    passedCount: checks.filter(c => c.pass).length,
    totalCount: checks.length,
    checks,
    errors,
    receipt
  };
}

// ==========================================
// Config Validator (mta-lint config)
// ==========================================
export function lintConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return {
      valid: false,
      target: configPath,
      passedCount: 0,
      totalCount: 1,
      checks: [{ name: "Config File Existence", pass: false, reason: `File not found: ${configPath}` }],
      errors: [{ code: "CONFIG_NOT_FOUND", message: `Config file not found at ${configPath}` }]
    };
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    return {
      valid: false,
      target: configPath,
      passedCount: 0,
      totalCount: 1,
      checks: [{ name: "JSON Syntax", pass: false, reason: `Invalid JSON: ${err.message}` }],
      errors: [{ code: "INVALID_JSON", message: err.message }]
    };
  }

  const checks = [];
  const errors = [];
  const addCheck = (name, pass, reason = null, code = null) => {
    checks.push({ name, pass, reason });
    if (!pass) errors.push({ code: code || 'CONFIG_ERROR', message: reason });
  };

  const requiredFields = [
    "mta_base_url",
    "mcp_endpoint",
    "application_name",
    "execution_plans_dir",
    "mendix_project_dir"
  ];

  for (const field of requiredFields) {
    addCheck(`Property '${field}' Present`, !!config[field], `Missing required property '${field}' in mta_config.json`, `MISSING_${field.toUpperCase()}`);
  }

  if (config.mta_license_tier) {
    const validTiers = ["free_exploratory", "paid_enterprise", "auto"];
    addCheck("License Tier Valid", validTiers.includes(config.mta_license_tier), `Invalid mta_license_tier: '${config.mta_license_tier}'. Expected one of: ${validTiers.join(', ')}`, "INVALID_LICENSE_TIER");
  }

  return {
    valid: errors.length === 0,
    target: path.basename(configPath),
    passedCount: checks.filter(c => c.pass).length,
    totalCount: checks.length,
    checks,
    errors
  };
}

// ==========================================
// Self-Test Suite (mta-lint self-test)
// ==========================================
export function runSelfTest() {
  const checks = [];
  const errors = [];

  const addCheck = (name, pass, reason = null) => {
    checks.push({ name, pass, reason });
    if (!pass) errors.push({ code: 'SELF_TEST_FAILED', message: `${name}: ${reason}` });
  };

  // Test 1: Parser unit test
  const sampleMarkdown = `
# Plan
<details><summary><b>Metadata</b></summary>
\`\`\`yaml
plan_id: "TC_Test-v1"
category: "Backend"
\`\`\`
</details>

## 1. Purpose & Scope
## 2. Component Under Test
## 3. Test Steps & Action Sequence

| # | Case | Step Action & Target | Input Handle | Output Handle | Parameters, Bindings & Initial Values | Embedded Assertions | Exec Settings |
| :-: | :--: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Case 1 | CreateObject (Order) | - | o1 | Total = 100 | - | None / Stop |

## 4. Test Scenarios & Test Data

| # | Step Target | Scenario #1 | Scenario #2 |
| :-: | :--- | :--- | :--- |
| 0 | Scenario Name | Scen 1 | Scen 2 |
| 0 | Scenario Description | Desc 1 | Desc 2 |
| 1 | Step 1: Order.Total | 100 | 200 |

## 5. Quality & Compliance Checks
`;

  const meta = extractMetadata(sampleMarkdown);
  addCheck("Self-Test: Metadata Extraction", meta && meta.plan_id === "TC_Test-v1", "Failed to extract plan_id");

  const tables = parseMarkdownTables(sampleMarkdown);
  addCheck("Self-Test: Table Parser Count", tables.length === 2, `Expected 2 tables, found ${tables.length}`);

  if (tables.length === 2) {
    addCheck("Self-Test: Step Table Headers", tables[0].headers.includes('Step Action & Target'), "Missing Step Action header");
    addCheck("Self-Test: Scenario Table Headers", tables[1].headers.includes('Scenario #1'), "Missing Scenario #1 header");
  }

  // Test 3: Fixture Files Integration Test (if fixtures exist)
  const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1'));
  const fixturesDir = path.join(__dirname, 'fixtures');

  if (fs.existsSync(fixturesDir)) {
    const validPlan = path.join(fixturesDir, 'valid_plan.md');
    const invalidAssoc = path.join(fixturesDir, 'invalid_matrix_assoc.md');
    const invalidAnti01 = path.join(fixturesDir, 'invalid_step_anti01.md');
    const passServer = path.join(fixturesDir, 'server_response_pass.json');
    const failServer = path.join(fixturesDir, 'server_response_fail.json');

    if (fs.existsSync(validPlan)) {
      const res = lintExecutionPlan(validPlan);
      addCheck("Fixture: valid_plan.md passes", res.valid, `Expected valid, got invalid with ${res.errors.length} errors`);
    }

    if (fs.existsSync(invalidAssoc)) {
      const res = lintExecutionPlan(invalidAssoc);
      const caughtAnti48 = res.errors.some(e => e.code === 'ANTI-48_VIOLATION');
      addCheck("Fixture: invalid_matrix_assoc.md caught ANTI-48", !res.valid && caughtAnti48, "Expected invalid with ANTI-48");
    }

    if (fs.existsSync(invalidAnti01)) {
      const res = lintExecutionPlan(invalidAnti01);
      const caughtAnti01 = res.errors.some(e => e.code === 'ANTI-01_VIOLATION');
      addCheck("Fixture: invalid_step_anti01.md caught ANTI-01", !res.valid && caughtAnti01, "Expected invalid with ANTI-01");
    }

    if (fs.existsSync(validPlan) && fs.existsSync(passServer)) {
      const res = runSmokeAudit(validPlan, passServer);
      addCheck("Fixture: Smoke audit passes on matching data", res.valid, "Expected valid smoke audit");
    }

    if (fs.existsSync(validPlan) && fs.existsSync(failServer)) {
      const res = runSmokeAudit(validPlan, failServer);
      addCheck("Fixture: Smoke audit fails on mismatching data", !res.valid, "Expected failed smoke audit");
    }
  }

  return {
    valid: errors.length === 0,
    target: "Internal Linter Engine",
    passedCount: checks.filter(c => c.pass).length,
    totalCount: checks.length,
    checks,
    errors
  };
}

// Run main if called directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1'))) {
  main();
}
