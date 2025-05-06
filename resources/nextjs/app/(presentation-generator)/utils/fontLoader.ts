export const loadFont = async (url: string): Promise<void> => {
    // Check if the font is already loaded
    const existingLink = document.head.querySelector(`link[href="${url}"]`);
    if (existingLink) return;

    // Create a new link element
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.setAttribute('data-theme-font', 'true'); // Add this to identify theme fonts

    // Create a promise that resolves when the font is loaded
    const loaded = new Promise((resolve, reject) => {
        link.onload = resolve;
        link.onerror = reject;
    });

    // Add the link to the document head
    document.head.appendChild(link);

    // Wait for the font to load
    await loaded;
};

