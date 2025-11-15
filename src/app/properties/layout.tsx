export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <nav className="mb-6 flex items-center justify-between">
        <div className="font-semibold text-brand">Flex Living</div>
        <div className="flex gap-6 text-sm text-muted">
          <a href="/properties" className="underline text-brand">All listings</a>
          <a href="#" className="hover:underline">About Us</a>
          <a href="#" className="hover:underline">Contact Us</a>
        </div>
      </nav>
      {children}
      <footer className="mt-10 border-t border-border pt-6 text-sm text-muted">
        <div className="flex items-center gap-6">
          <span>Privacy Policy</span>
          <span>Terms and conditions</span>
          <span>+447723745646</span>
          <span>info@theflexliving.com</span>
        </div>
      </footer>
    </div>
  );
}