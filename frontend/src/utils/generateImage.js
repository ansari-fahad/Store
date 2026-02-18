import { toPng } from 'html-to-image';

// Function to generate image and return blob/dataUrl
export const generateInvoiceImage = async (elementId) => {
    const node = document.getElementById(elementId);
    if (!node) {
        console.error("Invoice element not found!");
        return null;
    }

    try {
        const dataUrl = await toPng(node, {
            quality: 0.95,
            backgroundColor: '#ffffff', // Ensure white background
            width: 800,
            height: node.scrollHeight || 1123, // A4 approx height in pixels at 96dpi
            style: {
                visibility: 'visible',
                position: 'absolute', // Keep absolute to avoid reflow affecting others
                top: '0',
                left: '0',
                zIndex: '9999', // Bring to front during capture
                background: '#ffffff', // Double ensure background
                color: '#000000', // Double ensure text color
                transform: 'none'
            }
        });
        return dataUrl;
    } catch (error) {
        console.error('Error generating image:', error);
        return null;
    }
};
