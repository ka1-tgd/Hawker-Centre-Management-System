const colours = {
    customer: "#2b3a8f",
    hawker: "#26a354",
    officer: "#4c3a6e"
};

export function applyTheme(role){

    const colour = colours[role] || "#ea5656";

    document.documentElement.style.setProperty(
        "--theme-colour",
        colour
    );
}