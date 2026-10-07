// Remonté à chaque navigation : donne un léger fondu d'entrée à chaque nouvelle page.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="duration-300 animate-in fade-in-0">{children}</div>;
}
