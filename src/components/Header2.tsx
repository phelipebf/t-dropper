import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
    return (
        <header className="flex items-center justify-between px-8 py-4 border-b">
            <div className="flex items-center gap-4">
                {/* GitHub Link */}
                <a
                    href="https://github.com/your-username/tdropper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-75 transition-opacity"
                >
                    <FaGithub size={24} />
                </a>

                {/* Title */}
                <h1 className="text-2xl font-bold">tdropper</h1>
            </div>

            {/* Connect Button */}
            <ConnectButton />
        </header>
    );
}