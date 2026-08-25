/* =========================================================
   TRISOLVE - Interactive Mathematics Guide
   Stable version: working methods + guided steps + SVG
   triangle visualization.
   ========================================================= */

let selectedMethod = "";
let steps = [];
let currentStep = 0;

const $ = (id) => document.getElementById(id);

/* -------------------------
   STARTUP
------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    const methods = [
        ["triangleSum", "sum"],
        ["sss", "sss"],
        ["sas", "sas"],
        ["asa", "asa"],
        ["aas", "aas"]
    ];

    methods.forEach(([id, method]) => {
        const button = $(id);
        if (button) {
            button.addEventListener("click", function () {
                selectMethod(method, this);
            });
        }
    });

    if ($("solveProblem")) $("solveProblem").addEventListener("click", solveProblem);
    if ($("reset")) $("reset").addEventListener("click", resetProblem);
    if ($("nextStep")) $("nextStep").addEventListener("click", nextStep);
    if ($("previousStep")) $("previousStep").addEventListener("click", previousStep);

    updateGuide();
});

/* -------------------------
   BASIC HELPERS
------------------------- */
function getNumber(id) {
    const el = $(id);
    if (!el) return null;

    const value = el.value.trim();
    if (value === "") return null;

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function roundNumber(number) {
    return Math.round(number * 100) / 100;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function positive(value) {
    return value !== null && Number.isFinite(value) && value > 0;
}

function validAngle(value) {
    return value !== null && Number.isFinite(value) && value > 0 && value < 180;
}

function setValue(id, value) {
    if ($(id) && value !== null && Number.isFinite(value)) {
        $(id).value = roundNumber(value);
    }
}

function showResult(message) {
    if ($("result")) {
        $("result").innerHTML = message;
        $("result").classList.remove("result-refresh");
        void $("result").offsetWidth;
        $("result").classList.add("result-refresh");
    }
}

function showError(message) {
    showResult('<strong>Check your input:</strong><br>' + message);
    steps = [];
    currentStep = 0;
    updateGuide();
}

/* -------------------------
   METHOD SELECTION
------------------------- */
function selectMethod(method, button) {
    selectedMethod = method;

    document.querySelectorAll(".method").forEach(function (b) {
        b.classList.remove("active");
    });

    if (button) button.classList.add("active");

    steps = [];
    currentStep = 0;

    const tips = {
        sum: "Triangle Sum: use A + B + C = 180°.",
        sss: "SSS: all three sides are known; use the Law of Cosines.",
        sas: "SAS: two sides and their included angle are known.",
        asa: "ASA: two angles and the included side are known.",
        aas: "AAS: two angles and one non-included side are known."
    };

    const facts = {
        sum: "The three interior angles of every triangle always add up to 180°.",
        sss: "In SSS, the side opposite the largest angle is the longest side.",
        sas: "In SAS, the known angle must be between the two known sides.",
        asa: "In ASA, the known side lies between the two known angles.",
        aas: "In AAS, the known side is not between the two known angles."
    };

    if ($("tip")) $("tip").textContent = tips[method];
    if ($("factText")) $("factText").textContent = facts[method];
    showResult('Method selected. Enter your values and press <strong>"Solve Problem"</strong>.');
    updateGuide();
}

/* -------------------------
   MAIN SOLVER
------------------------- */
function solveProblem() {
    const a = getNumber("sideA");
    const b = getNumber("sideB");
    const c = getNumber("sideC");
    const A = getNumber("angleA");
    const B = getNumber("angleB");
    const C = getNumber("angleC");

    steps = [];
    currentStep = 0;

    if (!selectedMethod) {
        showError("Please choose a method first.");
        return;
    }

    if (selectedMethod === "sum") solveTriangleSum(A, B, C);
    else if (selectedMethod === "sss") solveSSS(a, b, c);
    else if (selectedMethod === "sas") solveSAS(a, b, c, A, B, C);
    else if (selectedMethod === "asa") solveASA(a, b, c, A, B, C);
    else if (selectedMethod === "aas") solveAAS(a, b, c, A, B, C);
}

/* =========================================================
   TRIANGLE SUM
========================================================= */
function solveTriangleSum(A, B, C) {
    if ([A, B, C].filter(v => v !== null).length !== 2) {
        showError("Triangle Sum requires exactly two known angles and one blank angle.");
        return;
    }

    if ((A !== null && !validAngle(A)) || (B !== null && !validAngle(B)) || (C !== null && !validAngle(C))) {
        showError("Angles must be greater than 0° and less than 180°.");
        return;
    }

    let missingAngle;
    let missingName;

    if (A === null) {
        missingAngle = 180 - B - C;
        missingName = "A";
    } else if (B === null) {
        missingAngle = 180 - A - C;
        missingName = "B";
    } else {
        missingAngle = 180 - A - B;
        missingName = "C";
    }

    if (!validAngle(missingAngle)) {
        showError("The given angles cannot form a valid triangle.");
        return;
    }

    missingAngle = roundNumber(missingAngle);

    const finalA = A === null ? missingAngle : A;
    const finalB = B === null ? missingAngle : B;
    const finalC = C === null ? missingAngle : C;

    setTriangleData(null, null, null, finalA, finalB, finalC);

    steps = [
        { title: "1. Identify what is known", text: `Angles B and C are ${B}° and ${C}°. Angle ${missingName} is the only unknown.` },
        { title: "2. Write the triangle-sum rule", text: "All three interior angles of a triangle must total 180°.", formula: "A + B + C = 180°" },
        { title: "3. Substitute the known angles", text: "Replace the known angle letters with their values before calculating.", formula: getAngleCalculation(A, B, C, missingName) },
        { title: "4. Do the subtraction", text: `Start with 180° and subtract the two known angles.`, calculation: `${missingName} = 180° − ${missingName === "A" ? B : A}° − ${missingName === "A" ? C : (missingName === "B" ? C : B)}°` },
        { title: "5. Find the missing angle", text: `The remaining angle is ${missingAngle}°.`, calculation: `∠${missingName} = ${missingAngle}°` },
        { title: "6. Check your answer", text: "Add all three angles. The total should be exactly 180°.", calculation: `${finalA}° + ${finalB}° + ${finalC}° = ${roundNumber(finalA + finalB + finalC)}° ✓` },
        { title: "7. Final Answer", text: "The missing angle has now been found and checked.", calculation: `∠${missingName} = <strong>${missingAngle}°</strong>` }
    ];

    showResult('Solution calculated. Use <strong>Next →</strong> to work through each step. The final answer appears at the last step.');
    updateGuide();
}

function getAngleCalculation(A, B, C, missing) {
    if (missing === "A") return `A = 180° − ${B}° − ${C}°`;
    if (missing === "B") return `B = 180° − ${A}° − ${C}°`;
    return `C = 180° − ${A}° − ${B}°`;
}

/* =========================================================
   SSS
========================================================= */
function solveSSS(a, b, c) {
    if (![a, b, c].every(positive)) {
        showError("SSS requires three positive side lengths.");
        return;
    }

    if (a + b <= c || a + c <= b || b + c <= a) {
        showError("These side lengths cannot form a valid triangle. Remember the triangle inequality.");
        return;
    }

    const A = toDegrees(Math.acos(clamp((b*b + c*c - a*a) / (2*b*c), -1, 1)));
    const B = toDegrees(Math.acos(clamp((a*a + c*c - b*b) / (2*a*c), -1, 1)));
    const C = 180 - A - B;

    setTriangleData(a, b, c, A, B, C);

    steps = [
        { title: "1. Identify what is known", text: `All three side lengths are known: a = ${a}, b = ${b}, and c = ${c}. Because the three sides are given, this is SSS.` },
        { title: "2. Choose a starting angle", text: "Use the Law of Cosines to find an angle from the three known sides.", formula: "a² = b² + c² − 2bc cos(A)" },
        { title: "3. Substitute the side values", text: "Put the given side lengths into the formula for angle A.", formula: `cos(A) = (${b}² + ${c}² − ${a}²) / (2 × ${b} × ${c})` },
        { title: "4. Calculate Angle A", text: "Use the inverse cosine (cos⁻¹) to turn the cosine ratio into an angle.", calculation: `A = cos⁻¹((b² + c² − a²)/(2bc)) ≈ <strong>${roundNumber(A)}°</strong>` },
        { title: "5. Find Angle B", text: "Use the Law of Cosines again, this time solving for angle B.", formula: "b² = a² + c² − 2ac cos(B)", calculation: `B = cos⁻¹((a² + c² − b²)/(2ac)) ≈ <strong>${roundNumber(B)}°</strong>` },
        { title: "6. Find the last angle", text: "Once two angles are known, the Triangle Sum gives the remaining angle.", formula: "C = 180° − A − B", calculation: `C = 180° − ${roundNumber(A)}° − ${roundNumber(B)}° ≈ <strong>${roundNumber(C)}°</strong>` },
        { title: "7. Check the angles", text: "Add A, B, and C. A correct triangle must total 180°.", calculation: `${roundNumber(A)}° + ${roundNumber(B)}° + ${roundNumber(C)}° ≈ 180° ✓` },
        { title: "8. Final Answer", text: "All three angles have been determined from the given sides.", calculation: `A ≈ <strong>${roundNumber(A)}°</strong><br>B ≈ <strong>${roundNumber(B)}°</strong><br>C ≈ <strong>${roundNumber(C)}°</strong>` }
    ];

    showResult('Solution calculated. Use <strong>Next →</strong> to follow the reasoning before viewing the final answer.');
    updateGuide();
}

/* =========================================================
   SAS
   Supports any included angle:
   a,b,C OR b,c,A OR a,c,B
========================================================= */
function solveSAS(a, b, c, A, B, C) {
    let side1, side2, includedAngle, oppositeSide, includedName;

    if (positive(a) && positive(b) && validAngle(C) && c === null && A === null && B === null) {
        side1 = a; side2 = b; includedAngle = C; oppositeSide = "c"; includedName = "C";
    } else if (positive(b) && positive(c) && validAngle(A) && a === null && B === null && C === null) {
        side1 = b; side2 = c; includedAngle = A; oppositeSide = "a"; includedName = "A";
    } else if (positive(a) && positive(c) && validAngle(B) && b === null && A === null && C === null) {
        side1 = a; side2 = c; includedAngle = B; oppositeSide = "b"; includedName = "B";
    } else {
        showError("SAS needs exactly two sides and the angle between them. Example: a, b, and C.");
        return;
    }

    const opposite = Math.sqrt(
        side1*side1 + side2*side2 - 2*side1*side2*Math.cos(toRadians(includedAngle))
    );

    let finalA, finalB, finalC, finala, finalb, finalc;

    if (oppositeSide === "c") {
        finala = a; finalb = b; finalc = opposite; finalC = includedAngle;
        finalA = toDegrees(Math.acos(clamp((b*b + finalc*finalc - a*a) / (2*b*finalc), -1, 1)));
        finalB = 180 - finalA - finalC;
    } else if (oppositeSide === "a") {
        finala = opposite; finalb = b; finalc = c; finalA = includedAngle;
        finalB = toDegrees(Math.acos(clamp((finala*finala + finalc*finalc - finalb*finalb) / (2*finala*finalc), -1, 1)));
        finalC = 180 - finalA - finalB;
    } else {
        finala = a; finalb = opposite; finalc = c; finalB = includedAngle;
        finalA = toDegrees(Math.acos(clamp((finalb*finalb + finalc*finalc - finala*finala) / (2*finalb*finalc), -1, 1)));
        finalC = 180 - finalA - finalB;
    }

    if (!validAngle(finalA) || !validAngle(finalB) || !validAngle(finalC)) {
        showError("The given SAS values cannot form a valid triangle.");
        return;
    }

    setTriangleData(finala, finalb, finalc, finalA, finalB, finalC);

    steps = [
        { title: "1. Identify the given information", text: `The known sides are ${side1} and ${side2}, and angle ${includedName} = ${includedAngle}°. Because the angle is between the two sides, this is SAS.` },
        { title: "2. Choose the Law of Cosines", text: "The Law of Cosines finds the side opposite the included angle.", formula: `${oppositeSide}² = ${side1}² + ${side2}² − 2(${side1})(${side2})cos(${includedName})` },
        { title: "3. Substitute the values", text: "Replace the letters with the numbers from the problem.", formula: `${oppositeSide}² = ${side1}² + ${side2}² − 2(${side1})(${side2})cos(${includedAngle}°)` },
        { title: "4. Calculate the missing side", text: "Evaluate the expression and take the square root to get the side length.", calculation: `${oppositeSide} ≈ <strong>${roundNumber(opposite)}</strong>` },
        { title: "5. Find one remaining angle", text: "Now that all three sides are known, the Law of Cosines can be used again to find a missing angle." },
        { title: "6. Use the Triangle Sum", text: "After finding one remaining angle, subtract the two known angles from 180° to get the last angle.", formula: "A + B + C = 180°", calculation: `A ≈ ${roundNumber(finalA)}°, B ≈ ${roundNumber(finalB)}°, C = ${roundNumber(finalC)}°` },
        { title: "7. Check the triangle", text: "The three angles should total 180°, and the side lengths should satisfy the triangle inequality.", calculation: `${roundNumber(finalA)}° + ${roundNumber(finalB)}° + ${roundNumber(finalC)}° ≈ 180° ✓` },
        { title: "8. Final Answer", text: "The complete triangle has now been solved.", calculation: `a ≈ <strong>${roundNumber(finala)}</strong><br>b ≈ <strong>${roundNumber(finalb)}</strong><br>c ≈ <strong>${roundNumber(finalc)}</strong><br>A ≈ <strong>${roundNumber(finalA)}°</strong><br>B ≈ <strong>${roundNumber(finalB)}°</strong><br>C ≈ <strong>${roundNumber(finalC)}°</strong>` }
    ];

    showResult('Solution calculated. Use <strong>Next →</strong> to follow each calculation step.');
    updateGuide();
}

/* =========================================================
   ASA
   Supports A+B+c, B+C+a, or A+C+b.
========================================================= */
function solveASA(a, b, c, A, B, C) {
    let finalA, finalB, finalC, finala, finalb, finalc;
    let includedSide, angle1, angle2;

    if (validAngle(A) && validAngle(B) && positive(c) && a === null && b === null && C === null) {
        finalA = A; finalB = B; finalC = 180 - A - B; finalc = c;
        includedSide = "c"; angle1 = "A"; angle2 = "B";
        finala = c * Math.sin(toRadians(A)) / Math.sin(toRadians(finalC));
        finalb = c * Math.sin(toRadians(B)) / Math.sin(toRadians(finalC));
    } else if (validAngle(B) && validAngle(C) && positive(a) && b === null && c === null && A === null) {
        finalB = B; finalC = C; finalA = 180 - B - C; finala = a;
        includedSide = "a"; angle1 = "B"; angle2 = "C";
        finalb = a * Math.sin(toRadians(B)) / Math.sin(toRadians(finalA));
        finalc = a * Math.sin(toRadians(C)) / Math.sin(toRadians(finalA));
    } else if (validAngle(A) && validAngle(C) && positive(b) && a === null && c === null && B === null) {
        finalA = A; finalC = C; finalB = 180 - A - C; finalb = b;
        includedSide = "b"; angle1 = "A"; angle2 = "C";
        finala = b * Math.sin(toRadians(A)) / Math.sin(toRadians(finalB));
        finalc = b * Math.sin(toRadians(C)) / Math.sin(toRadians(finalB));
    } else {
        showError("ASA needs two angles and the side between them. Examples: A + B + c, B + C + a, or A + C + b.");
        return;
    }

    if (!validAngle(finalA) || !validAngle(finalB) || !validAngle(finalC)) {
        showError("The given angles cannot form a valid triangle.");
        return;
    }

    setTriangleData(finala, finalb, finalc, finalA, finalB, finalC);

    const includedSideValue = includedSide === "a" ? finala : (includedSide === "b" ? finalb : finalc);

    steps = [
        { title: "1. Identify the given information", text: `Two angles (${angle1} and ${angle2}) and the included side ${includedSide} = ${roundNumber(includedSideValue)} are known. This is ASA because the side lies between the two known angles.` },
        { title: "2. Find the third angle", text: "Triangle angles always total 180°. Subtract the two known angles from 180°.", formula: "A + B + C = 180°", calculation: `The missing angle = 180° − the two known angles.` },
        { title: "3. Calculate the missing angle", text: `The third angle is ${roundNumber(finalA)}°, ${roundNumber(finalB)}°, or ${roundNumber(finalC)}°, depending on which angle was missing.` },
        { title: "4. Set up the Law of Sines", text: "Use the known side and its opposite angle as the reference pair.", formula: "a/sin(A) = b/sin(B) = c/sin(C)" },
        { title: "5. Substitute the known values", text: `Use side ${includedSide} and its opposite angle, then solve for each unknown side.` },
        { title: "6. Calculate the three sides", calculation: `a ≈ <strong>${roundNumber(finala)}</strong><br>b ≈ <strong>${roundNumber(finalb)}</strong><br>c ≈ <strong>${roundNumber(finalc)}</strong>` },
        { title: "7. Check the angle sum", text: "Add the three angles to confirm the triangle is consistent.", calculation: `${roundNumber(finalA)}° + ${roundNumber(finalB)}° + ${roundNumber(finalC)}° ≈ 180° ✓` },
        { title: "8. Final Answer", text: "The angles and all side lengths have been determined.", calculation: `A = <strong>${roundNumber(finalA)}°</strong><br>B = <strong>${roundNumber(finalB)}°</strong><br>C = <strong>${roundNumber(finalC)}°</strong><br>a ≈ <strong>${roundNumber(finala)}</strong><br>b ≈ <strong>${roundNumber(finalb)}</strong><br>c ≈ <strong>${roundNumber(finalc)}</strong>` }
    ];

    showResult('Solution calculated. Use <strong>Next →</strong> to reveal the reasoning one step at a time.');
    updateGuide();
}

/* =========================================================
   AAS
   Detects the known non-included side automatically.
========================================================= */
function solveAAS(a, b, c, A, B, C) {
    const angles = { A, B, C };
    const sides = { a, b, c };
    const knownAngles = Object.keys(angles).filter(k => validAngle(angles[k]));
    const knownSides = Object.keys(sides).filter(k => positive(sides[k]));

    if (knownAngles.length !== 2 || knownSides.length !== 1) {
        showError("AAS requires exactly two angles and one known non-included side.");
        return;
    }

    const sideName = knownSides[0];
    const sideValue = sides[sideName];

    // The known side must NOT be the side between the two known angles.
    const includedPairs = {
        c: ["A", "B"],
        a: ["B", "C"],
        b: ["A", "C"]
    };

    const pair = includedPairs[sideName];
    if (knownAngles.includes(pair[0]) && knownAngles.includes(pair[1])) {
        showError("The known side is the included side, which makes this ASA rather than AAS.");
        return;
    }

    let finalA = A, finalB = B, finalC = C;
    const missingAngleName = ["A", "B", "C"].find(k => !knownAngles.includes(k));
    const missingAngle = 180 - angles[knownAngles[0]] - angles[knownAngles[1]];

    if (!validAngle(missingAngle)) {
        showError("The two given angles cannot form a valid triangle.");
        return;
    }

    if (missingAngleName === "A") finalA = missingAngle;
    if (missingAngleName === "B") finalB = missingAngle;
    if (missingAngleName === "C") finalC = missingAngle;

    const oppositeAngleName = sideName.toUpperCase();
    const knownOppositeAngle = angles[oppositeAngleName];

    if (!validAngle(knownOppositeAngle)) {
        showError(`For AAS with side ${sideName}, its opposite angle ${oppositeAngleName} must be one of the two known angles.`);
        return;
    }

    const scale = sideValue / Math.sin(toRadians(knownOppositeAngle));
    const finala = sideName === "a" ? a : scale * Math.sin(toRadians(finalA));
    const finalb = sideName === "b" ? b : scale * Math.sin(toRadians(finalB));
    const finalc = sideName === "c" ? c : scale * Math.sin(toRadians(finalC));

    setTriangleData(finala, finalb, finalc, finalA, finalB, finalC);

    steps = [
        { title: "1. Identify the given information", text: `Two angles are known and side ${sideName} = ${sideValue} is known. The side is not between the two known angles, so this is AAS.` },
        { title: "2. Find the missing angle", text: "Use the Triangle Angle Sum because all three angles must total 180°.", formula: "A + B + C = 180°" },
        { title: "3. Calculate the missing angle", calculation: `${missingAngleName} = 180° − the two known angles = <strong>${roundNumber(missingAngle)}°</strong>` },
        { title: "4. Set up the Law of Sines", text: `Match the known side ${sideName} with its opposite angle ${oppositeAngleName}.`, formula: "a / sin(A) = b / sin(B) = c / sin(C)" },
        { title: "5. Substitute the known pair", text: `Use ${sideName} = ${sideValue} and angle ${oppositeAngleName} = ${roundNumber(knownOppositeAngle)}° as the reference pair.` },
        { title: "6. Calculate the missing sides", calculation: `a ≈ <strong>${roundNumber(finala)}</strong><br>b ≈ <strong>${roundNumber(finalb)}</strong><br>c ≈ <strong>${roundNumber(finalc)}</strong>` },
        { title: "7. Check the triangle", text: "Verify that the three angles add to 180° and that the side opposite the larger angle is longer.", calculation: `${roundNumber(finalA)}° + ${roundNumber(finalB)}° + ${roundNumber(finalC)}° ≈ 180° ✓` },
        { title: "8. Final Answer", text: "The complete triangle has now been solved using the given AAS information.", calculation: `A = <strong>${roundNumber(finalA)}°</strong><br>B = <strong>${roundNumber(finalB)}°</strong><br>C = <strong>${roundNumber(finalC)}°</strong><br>a ≈ <strong>${roundNumber(finala)}</strong><br>b ≈ <strong>${roundNumber(finalb)}</strong><br>c ≈ <strong>${roundNumber(finalc)}</strong>` }
    ];

    showResult('Solution calculated. Use <strong>Next →</strong> to work through the method before seeing the final answer.');
    updateGuide();
}

/* =========================================================
   GUIDED MODE
========================================================= */
function updateGuide() {
    const content = $("stepContent");
    const number = $("stepNumber");
    const progress = $("progressBar");
    const previous = $("previousStep");
    const next = $("nextStep");
    const factText = $("factText");

    if (!content || !number || !progress || !previous || !next) return;

    const methodFacts = {
        sum: "Every triangle has an angle sum of 180°. This lets you find a missing angle when two are known.",
        sss: "SSS means Side-Side-Side. With all three sides, the Law of Cosines can determine the angles.",
        sas: "SAS means Side-Angle-Side. The angle must be included between the two known sides.",
        asa: "ASA means Angle-Side-Angle. The known side is the side between the two known angles.",
        aas: "AAS means Angle-Angle-Side. The known side is opposite one of the known angles, not between them."
    };

    if (steps.length === 0) {
        content.innerHTML =
            '<div class="guide-icon">?</div>' +
            '<h3>Ready to Learn?</h3>' +
            '<p>Choose a method, enter your values, and press <strong>Solve Problem</strong>. Then use <strong>Next →</strong> to reveal the solution one step at a time.</p>';
        number.textContent = "0 / 0";
        progress.style.width = "0%";
        previous.disabled = true;
        next.disabled = true;
        if (factText) factText.textContent = methodFacts[selectedMethod] || "Every triangle has three interior angles whose sum is 180°.";
        return;
    }

    currentStep = Math.max(0, Math.min(currentStep, steps.length - 1));
    const step = steps[currentStep];

    content.classList.remove("step-change");
    void content.offsetWidth;
    content.classList.add("step-change");

    content.innerHTML =
        '<div class="guide-icon">' + (currentStep + 1) + '</div>' +
        '<div class="step-label">GUIDED STEP</div>' +
        '<h3>' + step.title + '</h3>' +
        (step.text ? '<p>' + step.text + '</p>' : '') +
        (step.formula ? '<div class="formula"><span>Formula</span>' + step.formula + '</div>' : '') +
        (step.calculation ? '<div class="calculation"><span>Work</span>' + step.calculation + '</div>' : '') +
        (currentStep === steps.length - 1 ? '<div class="understand-note">✓ You can now compare the result with the original information.</div>' : '');

    number.textContent = (currentStep + 1) + " / " + steps.length;
    progress.style.width = ((currentStep + 1) / steps.length * 100) + "%";
    previous.disabled = currentStep === 0;
    next.disabled = currentStep === steps.length - 1;

    if (factText) {
        factText.textContent = methodFacts[selectedMethod] || "A triangle has three sides and three interior angles.";
        if (currentStep === steps.length - 1) {
            factText.textContent = "Always check your result: the angles should total 180°, and the side lengths must form a valid triangle.";
        }
    }
}

function nextStep() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateGuide();
    }
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateGuide();
    }
}

/* =========================================================
   INTERACTIVE SVG TRIANGLE
========================================================= */
let triangleData = {
    a: null, b: null, c: null,
    A: null, B: null, C: null
};

function setTriangleData(a, b, c, A, B, C) {
    triangleData = { a, b, c, A, B, C };
    updateTriangleVisualization();
}

function updateTriangleVisualization() {
    const triangle = $("triangleShape");
    const svg = $("triangleSVG");
    if (!triangle || !svg) return;

    let { a, b, c, A, B, C } = triangleData;

    // If only angles are known, use sine-law proportions for the drawing.
    if (A !== null && B !== null && C !== null && (a === null || b === null || c === null)) {
        a = Math.sin(toRadians(A));
        b = Math.sin(toRadians(B));
        c = Math.sin(toRadians(C));
    }

    // If nothing is known, keep the default triangle.
    if ([a, b, c, A, B, C].every(v => v === null)) return;

    // If only some sides are available, use the known values and fill the rest
    // from angles when possible. This keeps the visualization meaningful.
    if (a === null || b === null || c === null) {
        if (A !== null && B !== null && C !== null) {
            a = Math.sin(toRadians(A));
            b = Math.sin(toRadians(B));
            c = Math.sin(toRadians(C));
        } else {
            // Before a complete solution, use a readable proportional sketch.
            const known = [a, b, c].filter(positive);
            const base = known.length ? Math.max(...known) : 1;
            a = positive(a) ? a : base;
            b = positive(b) ? b : base;
            c = positive(c) ? c : base;
        }
    }

    // Put B and C at the base endpoints; side a is BC.
    const Bx = 70;
    const By = 285;
    const Cx = 430;
    const Cy = 285;

    // Scale while preserving proportions.
    const maxSide = Math.max(a, b, c, 1e-9);
    const scale = 310 / maxSide;

    let x = (b*b + c*c - a*a) / (2*c);
    let ySquared = Math.max(0, b*b - x*x);
    let y = Math.sqrt(ySquared);

    x *= scale;
    y *= scale;

    let Ax = Bx + x;
    let Ay = By - y;

    // Keep the apex inside the SVG viewBox.
    const minX = 45;
    const maxX = 455;
    const minY = 45;
    const maxY = 285;

    Ax = clamp(Ax, minX, maxX);
    Ay = clamp(Ay, minY, maxY);

    triangle.setAttribute("points", `${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`);

    setSvgText("labelA", Ax, Ay - 16, "A");
    setSvgText("labelB", Bx - 25, By + 22, "B");
    setSvgText("labelC", Cx + 12, Cy + 22, "C");

    setSvgText("labelSideA", (Bx + Cx) / 2, By + 32, positive(triangleData.a) ? `a = ${roundNumber(triangleData.a)}` : "a");
    setSvgText("labelSideB", (Ax + Cx) / 2 + 12, (Ay + Cy) / 2, positive(triangleData.b) ? `b = ${roundNumber(triangleData.b)}` : "b");
    setSvgText("labelSideC", (Ax + Bx) / 2 - 28, (Ay + By) / 2, positive(triangleData.c) ? `c = ${roundNumber(triangleData.c)}` : "c");

    // Show angle values near vertices when available.
    setSvgText("labelAngleA", Ax, Ay + 35, validAngle(triangleData.A) ? `${roundNumber(triangleData.A)}°` : "");
    setSvgText("labelAngleB", Bx + 30, By - 18, validAngle(triangleData.B) ? `${roundNumber(triangleData.B)}°` : "");
    setSvgText("labelAngleC", Cx - 35, Cy - 18, validAngle(triangleData.C) ? `${roundNumber(triangleData.C)}°` : "");

    svg.classList.remove("triangle-updated");
    void svg.offsetWidth;
    svg.classList.add("triangle-updated");
}

function setSvgText(id, x, y, text) {
    const element = $(id);
    if (!element) return;
    element.setAttribute("x", x);
    element.setAttribute("y", y);
    element.textContent = text;
}

/* -------------------------
   RESET
------------------------- */
function resetProblem() {
    ["sideA", "sideB", "sideC", "angleA", "angleB", "angleC"].forEach(function (id) {
        if ($(id)) $(id).value = "";
    });

    document.querySelectorAll(".method").forEach(function (button) {
        button.classList.remove("active");
    });

    selectedMethod = "";
    steps = [];
    currentStep = 0;
    triangleData = { a: null, b: null, c: null, A: null, B: null, C: null };

    showResult('Enter values and press <strong>"Solve Problem"</strong>.');

    if ($("tip")) {
        $("tip").textContent = "Choose the method that matches the information given in your triangle.";
    }

    updateGuide();

    // Return SVG to the default shape.
    const triangle = $("triangleShape");
    if (triangle) triangle.setAttribute("points", "80,280 420,280 250,70");
    ["labelA", "labelB", "labelC"].forEach((id, i) => {
        const positions = [[250,50],[55,300],[430,300]];
        setSvgText(id, positions[i][0], positions[i][1], ["A","B","C"][i]);
    });
    setSvgText("labelSideA", 250, 315, "a");
    setSvgText("labelSideB", 150, 175, "b");
    setSvgText("labelSideC", 330, 175, "c");
    setSvgText("labelAngleA", 250, 105, "");
    setSvgText("labelAngleB", 100, 255, "");
    setSvgText("labelAngleC", 400, 255, "");
}
