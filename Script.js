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

    if ($("tip")) $("tip").textContent = tips[method];
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
    setValue("angle" + missingName, missingAngle);

    const finalA = A === null ? missingAngle : A;
    const finalB = B === null ? missingAngle : B;
    const finalC = C === null ? missingAngle : C;

    setTriangleData(null, null, null, finalA, finalB, finalC);

    steps = [
        {
            title: "Identify the given information",
            text: `Two angles are known and angle ${missingName} is unknown.`
        },
        {
            title: "Use the Triangle Angle Sum",
            text: "The interior angles of every triangle add up to 180°.",
            formula: "A + B + C = 180°"
        },
        {
            title: "Substitute the known values",
            formula: getAngleCalculation(A, B, C, missingName)
        },
        {
            title: "Solve for the missing angle",
            calculation: `${missingName} = 180° − known angles = ${missingAngle}°`
        },
        {
            title: "Final Answer",
            calculation: `∠${missingName} = <strong>${missingAngle}°</strong>`
        }
    ];

    showResult(`∠${missingName} = <strong>${missingAngle}°</strong>`);
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

    setValue("angleA", A);
    setValue("angleB", B);
    setValue("angleC", C);
    setTriangleData(a, b, c, A, B, C);

    steps = [
        { title: "Identify the method", text: "All three sides are known, so this is an SSS problem." },
        { title: "Use the Law of Cosines", formula: "a² = b² + c² − 2bc cos(A)" },
        { title: "Find Angle A", calculation: `A ≈ ${roundNumber(A)}°` },
        { title: "Find Angle B", calculation: `B ≈ ${roundNumber(B)}°` },
        { title: "Use the Triangle Sum", calculation: `C = 180° − A − B ≈ ${roundNumber(C)}°` },
        { title: "Final Answer", calculation: `A ≈ ${roundNumber(A)}°<br>B ≈ ${roundNumber(B)}°<br>C ≈ ${roundNumber(C)}°` }
    ];

    showResult(`A ≈ <strong>${roundNumber(A)}°</strong><br>B ≈ <strong>${roundNumber(B)}°</strong><br>C ≈ <strong>${roundNumber(C)}°</strong>`);
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

    setValue("sideA", finala); setValue("sideB", finalb); setValue("sideC", finalc);
    setValue("angleA", finalA); setValue("angleB", finalB); setValue("angleC", finalC);
    setTriangleData(finala, finalb, finalc, finalA, finalB, finalC);

    steps = [
        { title: "Identify the method", text: `Two sides and included angle ${includedName} are known, so this is SAS.` },
        { title: "Use the Law of Cosines", formula: `${oppositeSide}² = side₁² + side₂² − 2(side₁)(side₂)cos(${includedName})` },
        { title: "Find the missing side", calculation: `${oppositeSide} ≈ ${roundNumber(opposite)}` },
        { title: "Find the remaining angles", text: "Use the Law of Cosines or Law of Sines, then check that the angles add to 180°." },
        { title: "Final Answer", calculation: `a ≈ ${roundNumber(finala)}<br>b ≈ ${roundNumber(finalb)}<br>c ≈ ${roundNumber(finalc)}<br>A ≈ ${roundNumber(finalA)}°<br>B ≈ ${roundNumber(finalB)}°<br>C ≈ ${roundNumber(finalC)}°` }
    ];

    showResult(`Missing side ${oppositeSide} ≈ <strong>${roundNumber(opposite)}</strong><br>A ≈ <strong>${roundNumber(finalA)}°</strong><br>B ≈ <strong>${roundNumber(finalB)}°</strong><br>C ≈ <strong>${roundNumber(finalC)}°</strong>`);
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

    setValue("sideA", finala); setValue("sideB", finalb); setValue("sideC", finalc);
    setValue("angleA", finalA); setValue("angleB", finalB); setValue("angleC", finalC);
    setTriangleData(finala, finalb, finalc, finalA, finalB, finalC);

    steps = [
        { title: "Identify the method", text: `Two angles and included side ${includedSide} are known, so this is ASA.` },
        { title: "Find the third angle", formula: "A + B + C = 180°", calculation: `Missing angle = ${roundNumber(finalA)}°, ${roundNumber(finalB)}°, or ${roundNumber(finalC)}°` },
        { title: "Use the Law of Sines", formula: "a / sin(A) = b / sin(B) = c / sin(C)" },
        { title: "Calculate the unknown sides", calculation: `a ≈ ${roundNumber(finala)}<br>b ≈ ${roundNumber(finalb)}<br>c ≈ ${roundNumber(finalc)}` },
        { title: "Final Answer", calculation: `A = ${roundNumber(finalA)}°<br>B = ${roundNumber(finalB)}°<br>C = ${roundNumber(finalC)}°<br>a ≈ ${roundNumber(finala)}<br>b ≈ ${roundNumber(finalb)}<br>c ≈ ${roundNumber(finalc)}` }
    ];

    showResult(`C = <strong>${roundNumber(finalC)}°</strong><br>a ≈ <strong>${roundNumber(finala)}</strong><br>b ≈ <strong>${roundNumber(finalb)}</strong><br>c ≈ <strong>${roundNumber(finalc)}</strong>`);
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

    setValue("sideA", finala); setValue("sideB", finalb); setValue("sideC", finalc);
    setValue("angleA", finalA); setValue("angleB", finalB); setValue("angleC", finalC);
    setTriangleData(finala, finalb, finalc, finalA, finalB, finalC);

    steps = [
        { title: "Identify the method", text: `Two angles and non-included side ${sideName} are known, so this is AAS.` },
        { title: "Find the missing angle", formula: "A + B + C = 180°", calculation: `${missingAngleName} = ${roundNumber(missingAngle)}°` },
        { title: "Apply the Law of Sines", formula: "a / sin(A) = b / sin(B) = c / sin(C)" },
        { title: "Calculate the missing sides", calculation: `a ≈ ${roundNumber(finala)}<br>b ≈ ${roundNumber(finalb)}<br>c ≈ ${roundNumber(finalc)}` },
        { title: "Final Answer", calculation: `A = ${roundNumber(finalA)}°<br>B = ${roundNumber(finalB)}°<br>C = ${roundNumber(finalC)}°<br>a ≈ ${roundNumber(finala)}<br>b ≈ ${roundNumber(finalb)}<br>c ≈ ${roundNumber(finalc)}` }
    ];

    showResult(`C = <strong>${roundNumber(finalC)}°</strong><br>a ≈ <strong>${roundNumber(finala)}</strong><br>b ≈ <strong>${roundNumber(finalb)}</strong><br>c ≈ <strong>${roundNumber(finalc)}</strong>`);
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

    if (!content || !number || !progress || !previous || !next) return;

    if (steps.length === 0) {
        content.innerHTML =
            '<div class="guide-icon">?</div>' +
            '<h3>Ready to Learn?</h3>' +
            '<p>Choose a method, enter your values, and press Solve Problem.</p>';
        number.textContent = "0 / 0";
        progress.style.width = "0%";
        previous.disabled = true;
        next.disabled = true;
        return;
    }

    currentStep = Math.max(0, Math.min(currentStep, steps.length - 1));
    const step = steps[currentStep];

    content.innerHTML =
        '<div class="guide-icon">' + (currentStep + 1) + '</div>' +
        '<h3>' + step.title + '</h3>' +
        (step.text ? '<p>' + step.text + '</p>' : '') +
        (step.formula ? '<div class="formula">' + step.formula + '</div>' : '') +
        (step.calculation ? '<div class="calculation">' + step.calculation + '</div>' : '');

    number.textContent = (currentStep + 1) + " / " + steps.length;
    progress.style.width = ((currentStep + 1) / steps.length * 100) + "%";
    previous.disabled = currentStep === 0;
    next.disabled = currentStep === steps.length - 1;
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
    setSvgText("labelSideB", 345, 175, "b");
    setSvgText("labelSideC", 155, 175, "c");
    setSvgText("labelAngleA", 250, 105, "");
    setSvgText("labelAngleB", 100, 255, "");
    setSvgText("labelAngleC", 400, 255, "");
}
