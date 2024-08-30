export function hideContainer(container: HTMLElement) {
    container.setAttr("style", "display: none");
}
export function showContainer(container: HTMLElement) {
    container.setAttr("style", "display: flex");
}