import React from 'react';

const Footer: React.FC = () => (
    <footer className="w-full p-4 bg-gradient-to-br from-primary-50 to-secondary-50 text-gray-600 
    text-center fixed left-0 bottom-0">
        © {new Date().getFullYear()} NYSC Project by Pharm H. A Tama. All rights reserved.
    </footer>
);

export default Footer;
