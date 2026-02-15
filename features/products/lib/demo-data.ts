import Link from 'next/link';

// Mock Data for Product Detail (Orbit Desk Lamp)
// This mirrors the structure we expect from the backend but hardcoded for the demo page.
export const DEMO_PRODUCT = {
    id: 999,
    name: "Orbit Desk Lamp",
    price: 299.00,
    description: `A masterpiece of minimalist design, the Orbit Desk Lamp combines integrated LED technology with an architectural form, providing glare-free, adjustable illumination for modern workspaces.

    Features are not togardeet driving perdumers qscx and free to couti enno-s five moderal surface ensiared with consiuse masnboard and night only feature -suchigerourm and color practor.`,
    specs: {
        material: "Brushed Aluminum",
        dimensions: "12.1 x 16.0 cm",
        weight: "1.2 kg",
        lightSource: "Integrated LED 12W"
    },
    images: [
        "https://images.unsplash.com/photo-1507473888900-52e1ad14595d?q=80&w=1200&auto=format&fit=crop", // Main lamp
        "https://images.unsplash.com/photo-1507473888900-52e1ad14595d?q=80&w=300&auto=format&fit=crop", // Thumb 1
        "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?q=80&w=300&auto=format&fit=crop", // Detail 1
        "https://images.unsplash.com/photo-1534073828943-f801091a7d58?q=80&w=300&auto=format&fit=crop"  // Context
    ],
    variants: {
        sizes: [
            { id: 'std', name: 'Standard', label: 'Standard' },
            { id: 'lrg', name: 'Large', label: 'Large' }
        ],
        colors: [
            { id: 'alum', name: 'Brushed Aluminum', hex: '#E5E7EB' }, // gray-200
            { id: 'blk', name: 'Matte Black', hex: '#18181B' }, // zinc-950
            { id: 'gry', name: 'Space Gray', hex: '#4B5563' }  // gray-600
        ]
    }
};
