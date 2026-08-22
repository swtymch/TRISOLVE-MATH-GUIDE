let selectedMethod = "";
let steps = [];
let currentStep = 0;

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", function () {
    $("triangleSum").addEventListener("click", function () {
        selectMethod("sum", this);
    });

    $("sss").addEventListener("click", function () {
        selectMethod("sss", this);
    });

    $("sas").addEventListener("click", function () {
        selectMethod("sas", this);
    });

    $("asa").addEventListener("click", function () {
        selectMethod("asa", this);
    });

    $("aas").addEventListener("click", function () {
        selectMethod("aas", this);
    });

    $("solveProblem").addEventListener("click", solveProblem);
    $("reset").addEventListener("click", resetProblem);
    $("nextStep").addEventListener("click", nextStep);
    $("previousStep").addEventListener("click", previousStep);

    updateGuide();
});

function selectMethod(method, button) {
    selectedMethod = method;

    document.querySelectorAll(".method").forEach(function (b) {
        b.classList.remove("active");
    });

    button.classList.add("active");

    steps = [];
    currentStep = 0;

    $("result").innerHTML =
        'Method selected. Enter your values and press <strong>"Solve Problem"</strong>.';

    const tips = {
        sum: "Triangle Sum: use A + B + C = 180°.",
        sss: "SSS: all three sides are known; use the Law of Cosines.",
        sas: "SAS: two sides and their included angle are known.",
        asa: "ASA: two angles and the included side are known.",
        aas: "AAS: two angles and one non-included side are known."
    };

    $("tip").textContent = tips[method];
    updateGuide();
}

function getNumber(id) {
    const value = $(id).value.trim();

    if (value === "") {
        return null;
    }

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
        showError("Please select a solving method first.");
        return;
    }

    if (selectedMethod === "sum") {
        solveTriangleSum(A, B, C);
    } else if (selectedMethod === "sss") {
        solveSSS(a, b, c);
    } else if (selectedMethod === "sas") {
        solveSAS(a, b, C);
    } else if (selectedMethod === "asa") {
        solveASA(A, B, c);
    } else if (selectedMethod === "aas") {
        solveAAS(A, B, a);
    }
}

function solveTriangleSum(A, B, C) {
    let missing;
    let name;

    if (A === null && B !== null && C !== null) {
        missing = 180 - B - C;
        name = "A";
    } else if (B === null && A !== null && C !== null) {
        missing = 180 - A - C;
        name = "B";
    } else if (C === null && A !== null && B !== null) {
        missing = 180 - A - B;
        name = "C";
    } else {
        showError("Enter two known angles and leave one angle blank.");
        return;
    }

    if (missing <= 0 || missing >= 180) {
        showError("The given angles cannot form a valid triangle.");
        return;
    }

    missing = roundNumber(missing);

    if (name === "A") {
        $("angleA").value = missing;
    } else if (name === "B") {
        $("angleB").value = missing;
    } else {
        $("angleC").value = missing;
    }

    steps = [
        {
            title: "Identify the given information",
            text: "Two angles are known and angle " + name + " is unknown."
        },
        {
            title: "Use the Triangle Angle Sum",
            text: "The interior angles of every triangle add up to 180°.",
            formula: "A + B + C = 180°"
        },
        {
            title: "Substitute the known values",
            text: "Move the two known angles to the other side of the equation."
        },
        {
            title: "Solve for the missing angle",
            calculation: name + " = " + missing + "°"
        },
        {
            title: "Final Answer",
            text: "The missing angle is:",
            calculation: name + " = " + missing + "°"
        }
    ];

    showResult(name + ' = <strong>' + missing + '°</strong>');
    updateGuide();
}

function solveSSS(a, b, c) {
    if ([a, b, c].some(function (value) {
        return value === null;
    })) {
        showError("SSS requires all three sides.");
        return;
    }

    if (
        a <= 0 ||
        b <= 0 ||
        c <= 0 ||
        a + b <= c ||
        a + c <= b ||
        b + c <= a
    ) {
        showError("These side lengths cannot form a valid triangle.");
        return;
    }

    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    const cosB = (a * a + c * c - b * b) / (2 * a * c);

    const A = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosA))));
    const B = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosB))));
    const C = 180 - A - B;

    $("angleA").value = roundNumber(A);
    $("angleB").value = roundNumber(B);
    $("angleC").value = roundNumber(C);

    steps = [
        {
            title: "Identify the method",
            text: "All three sides are known, so this is an SSS problem."
        },
        {
            title: "Use the Law of Cosines",
            formula: "a² = b² + c² − 2bc cos(A)"
        },
        {
            title: "Find Angle A",
            calculation: "A ≈ " + roundNumber(A) + "°"
        },
        {
            title: "Find Angle B",
            calculation: "B ≈ " + roundNumber(B) + "°"
        },
        {
            title: "Use the Triangle Sum",
            calculation: "C = 180° − A − B ≈ " + roundNumber(C) + "°"
        },
        {
            title: "Final Answer",
            calculation:
                "A ≈ " + roundNumber(A) + "°<br>" +
                "B ≈ " + roundNumber(B) + "°<br>" +
                "C ≈ " + roundNumber(C) + "°"
        }
    ];

    showResult(
        "A ≈ <strong>" + roundNumber(A) + "°</strong><br>" +
        "B ≈ <strong>" + roundNumber(B) + "°</strong><br>" +
        "C ≈ <strong>" + roundNumber(C) + "°</strong>"
    );

    updateGuide();
}

function solveSAS(a, b, C) {
    if ([a, b, C].some(function (value) {
        return value === null;
    })) {
        showError("SAS requires two sides and their included angle C.");
        return;
    }

    if (a <= 0 || b <= 0 || C <= 0 || C >= 180) {
        showError("Enter valid positive sides and an angle between 0° and 180°.");
        return;
    }

    const c = Math.sqrt(
        a * a +
        b * b -
        2 * a * b * Math.cos(toRadians(C))
    );

    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    const A = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosA))));
    const B = 180 - A - C;

    if (B <= 0) {
        showError("The values cannot form a valid triangle.");
        return;
    }

    $("sideC").value = roundNumber(c);
    $("angleA").value = roundNumber(A);
    $("angleB").value = roundNumber(B);

    steps = [
        {
            title: "Identify the method",
            text: "Two sides and their included angle are known, so this is SAS."
        },
        {
            title: "Use the Law of Cosines",
            formula: "c² = a² + b² − 2ab cos(C)"
        },
        {
            title: "Find the missing side",
            calculation: "c ≈ " + roundNumber(c)
        },
        {
            title: "Find Angle A",
            calculation: "A ≈ " + roundNumber(A) + "°"
        },
        {
            title: "Find Angle B",
            calculation: "B = 180° − A − C ≈ " + roundNumber(B) + "°"
        },
        {
            title: "Final Answer",
            calculation:
                "c ≈ " + roundNumber(c) + "<br>" +
                "A ≈ " + roundNumber(A) + "°<br>" +
                "B ≈ " + roundNumber(B) + "°"
        }
    ];

    showResult(
        "c ≈ <strong>" + roundNumber(c) + "</strong><br>" +
        "A ≈ <strong>" + roundNumber(A) + "°</strong><br>" +
        "B ≈ <strong>" + roundNumber(B) + "°</strong>"
    );

    updateGuide();
}

function solveASA(A, B, c) {
    if ([A, B, c].some(function (value) {
        return value === null;
    })) {
        showError("ASA requires two angles A and B and the included side c.");
        return;
    }

    const C = 180 - A - B;

    if (A <= 0 || B <= 0 || C <= 0 || c <= 0) {
        showError("The given values cannot form a valid triangle.");
        return;
    }

    const a =
        c * Math.sin(toRadians(A)) /
        Math.sin(toRadians(C));

    const b =
        c * Math.sin(toRadians(B)) /
        Math.sin(toRadians(C));

    $("angleC").value = roundNumber(C);
    $("sideA").value = roundNumber(a);
    $("sideB").value = roundNumber(b);

    steps = [
        {
            title: "Identify the method",
            text: "Two angles and the included side are known, so this is ASA."
        },
        {
            title: "Find the third angle",
            formula: "C = 180° − A − B",
            calculation: "C = " + roundNumber(C) + "°"
        },
        {
            title: "Use the Law of Sines",
            formula: "a / sin(A) = c / sin(C)"
        },
        {
            title: "Find side a",
            calculation: "a ≈ " + roundNumber(a)
        },
        {
            title: "Find side b",
            formula: "b / sin(B) = c / sin(C)",
            calculation: "b ≈ " + roundNumber(b)
        },
        {
            title: "Final Answer",
            calculation:
                "C = " + roundNumber(C) + "°<br>" +
                "a ≈ " + roundNumber(a) + "<br>" +
                "b ≈ " + roundNumber(b)
        }
    ];

    showResult(
        "C = <strong>" + roundNumber(C) + "°</strong><br>" +
        "a ≈ <strong>" + roundNumber(a) + "</strong><br>" +
        "b ≈ <strong>" + roundNumber(b) + "</strong>"
    );

    updateGuide();
}

function solveAAS(A, B, a) {
    if ([A, B, a].some(function (value) {
        return value === null;
    })) {
        showError("AAS requires two angles A and B and a known side a.");
        return;
    }

    const C = 180 - A - B;

    if (A <= 0 || B <= 0 || C <= 0 || a <= 0) {
        showError("The given values cannot form a valid triangle.");
        return;
    }

    const b =
        a * Math.sin(toRadians(B)) /
        Math.sin(toRadians(A));

    const c =
        a * Math.sin(toRadians(C)) /
        Math.sin(toRadians(A));

    $("angleC").value = roundNumber(C);
    $("sideB").value = roundNumber(b);
    $("sideC").value = roundNumber(c);

    steps = [
        {
            title: "Identify the method",
            text: "Two angles and one non-included side are known, so this is AAS."
        },
        {
            title: "Find the missing angle",
            formula: "C = 180° − A − B",
            calculation: "C = " + roundNumber(C) + "°"
        },
        {
            title: "Apply the Law of Sines",
            formula: "a / sin(A) = b / sin(B)"
        },
        {
            title: "Calculate side b",
            calculation: "b ≈ " + roundNumber(b)
        },
        {
            title: "Calculate side c",
            formula: "a / sin(A) = c / sin(C)",
            calculation: "c ≈ " + roundNumber(c)
        },
        {
            title: "Final Answer",
            calculation:
                "C = " + roundNumber(C) + "°<br>" +
                "b ≈ " + roundNumber(b) + "<br>" +
                "c ≈ " + roundNumber(c)
        }
    ];

    showResult(
        "C = <strong>" + roundNumber(C) + "°</strong><br>" +
        "b ≈ <strong>" + roundNumber(b) + "</strong><br>" +
        "c ≈ <strong>" + roundNumber(c) + "</strong>"
    );

    updateGuide();
}

function showResult(message) {
    $("result").innerHTML = message;
}

function showError(message) {
    $("result").innerHTML = "<strong>Error:</strong> " + message;
    steps = [];
    currentStep = 0;
    updateGuide();
}

function updateGuide() {
    if (steps.length === 0) {
        $("stepContent").innerHTML =
            '<div class="guide-icon">?</div>' +
            '<h3>Ready to Learn?</h3>' +
            '<p>Choose a method, enter your values, and press Solve Problem.</p>';

        $("stepNumber").textContent = "0 / 0";
        $("progressBar").style.width = "0%";
        $("previousStep").disabled = true;
        $("nextStep").disabled = true;
        return;
    }

    const step = steps[currentStep];

    $("stepContent").innerHTML =
        '<div class="guide-icon">' + (currentStep + 1) + '</div>' +
        '<h3>' + step.title + '</h3>' +
        (step.text ? '<p>' + step.text + '</p>' : '') +
        (step.formula ? '<div class="formula">' + step.formula + '</div>' : '') +
        (step.calculation ? '<div class="calculation">' + step.calculation + '</div>' : '');

    $("stepNumber").textContent =
        (currentStep + 1) + " / " + steps.length;

    $("progressBar").style.width =
        ((currentStep + 1) / steps.length * 100) + "%";

    $("previousStep").disabled = currentStep === 0;
    $("nextStep").disabled = currentStep === steps.length - 1;
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

function resetProblem() {
    [
        "sideA",
        "sideB",
        "sideC",
        "angleA",
        "angleB",
        "angleC"
    ].forEach(function (id) {
        $(id).value = "";
    });

    document.querySelectorAll(".method").forEach(function (button) {
        button.classList.remove("active");
    });

    selectedMethod = "";
    steps = [];
    currentStep = 0;

    $("result").innerHTML =
        'Enter values and press <strong>"Solve Problem"</strong>.';

    $("tip").textContent =
        "Choose the method that matches the information given in your triangle.";

    updateGuide();
}