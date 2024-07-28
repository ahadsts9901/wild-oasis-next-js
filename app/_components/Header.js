import Logo from "@/app/_components/Logo";
import Navigation from "@/app/_components/Navigation";

export default function Header() {
  return (
    <header className="px-8 py-5 border-b border-primary-900">
      <div className="flex items-center justify-between  max-w-7xl mx-auto">
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}
