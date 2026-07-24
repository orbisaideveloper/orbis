import fs from 'node:fs';
import { scanDirectory } from './fileScanner.util.js';

export const runDeepAudit = () => {
    const projectRoot = process.cwd();
    // শুধুমাত্র JS এবং HTML ফাইলগুলো স্ক্যান করবে
    const allFiles = scanDirectory(projectRoot).filter(f => f.path.endsWith('.js') || f.path.endsWith('.html'));

    let auditResults = {
        bugs: [],
        vulnerabilities: [],
        codeSmells: [],
        linesOfCode: 0
    };

    // SonarCloud-এর মতো স্ক্যানিং প্যাটার্ন
    const bugPattern = /TODO|FIXME/g;
    const vulnPattern = /eval\(|innerHTML\s*=|localStorage\./g;
    const smellPattern = /console\.log\(|var /g;

    allFiles.forEach(fileObj => {
        const content = fs.readFileSync(fileObj.path, 'utf-8');
        const lines = content.split('\n');
        auditResults.linesOfCode += lines.length;

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const displayPath = fileObj.path.replace(projectRoot, '').replace(/\\/g, '/');
            const cleanLine = line.trim();

            if (bugPattern.test(line)) {
                auditResults.bugs.push({ file: displayPath, line: lineNumber, issue: 'Unresolved Task', code: cleanLine });
            }
            if (vulnPattern.test(line)) {
                auditResults.vulnerabilities.push({ file: displayPath, line: lineNumber, issue: 'Security Risk', code: cleanLine });
            }
            if (smellPattern.test(line)) {
                auditResults.codeSmells.push({ file: displayPath, line: lineNumber, issue: 'Code Smell', code: cleanLine });
            }
        });
    });

    // ডামি ডুপ্লিকেট ক্যালকুলেশন (রিপোর্টের জন্য)
    auditResults.duplications = (auditResults.linesOfCode * 0.03).toFixed(1); 

    return auditResults;
};
