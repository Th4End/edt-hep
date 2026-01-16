const Footer = () => {

  return (
    <footer className="bg-muted/30 text-muted-foreground py-4 mt-6 rounded-t-2xl border-t border-border/50 text-center bottom-0 w-full">
      <div className="text-xs mb-1">
        &copy; {new Date().getFullYear()} EDT C&D - Dev par <a href="https://linkedin.com/in/matheo-delaunay" className="underline hover:text-accent" target="_blank" rel="noreferrer">Mathéo </a> 
        - <a href="https://github.com/D-Seonay/edt-hep/issues/new" className="underline hover:text-accent" target="_blank" rel="noreferrer">Signaler un bug</a>
      </div>
    </footer>
  );
};

export default Footer;
