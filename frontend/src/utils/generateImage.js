import { toPng } from 'html-to-image';

// Function to generate image and return blob/dataUrl
export const generateInvoiceImage = async (elementId) => {
    const node = document.getElementById(elementId);
    if (!node) {
        console.error("Invoice element not found!");
        return null;
    }

    try {
        // Temporarily style correctly for capture if hidden
        const originalStyle = {
            position: node.style.position,
            top: node.style.top,
            left: node.style.left,
            zIndex: node.style.zIndex,
            display: node.style.display
        };

        // Make it visible but off-screen (if not already) or just ensure it renders
        // If it's "display: none", html-to-image won't capture it.
        // It's better if the parent component manages visibility, but we can ensure zIndex

        const dataUrl = await toPng(node, { quality: 0.95, backgroundColor: 'white' });
        return dataUrl;

    } catch (error) {
        console.error('oops, something went wrong!', error);
        return null;
    }
};
