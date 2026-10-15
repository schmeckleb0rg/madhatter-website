"use client";

const ctaLines = [
  { name: "Red Line", color: "#C60C30", station: "Lake", walkTime: "8 min", distance: "0.4 mi" },
  { name: "Blue Line", color: "#00A1DE", station: "Washington", walkTime: "10 min", distance: "0.5 mi" },
  { name: "Green Line", color: "#009B3A", station: "Madison/Wabash", walkTime: "5 min", distance: "0.2 mi" },
  { name: "Pink Line", color: "#E27EA6", station: "Madison/Wabash", walkTime: "5 min", distance: "0.2 mi" },
  { name: "Brown Line", color: "#62361B", station: "Madison/Wabash", walkTime: "5 min", distance: "0.2 mi" },
  { name: "Orange Line", color: "#F9461C", station: "Madison/Wabash", walkTime: "5 min", distance: "0.2 mi" },
  { name: "Purple Line", color: "#522398", station: "Madison/Wabash", walkTime: "5 min", distance: "0.2 mi" },
];

export default function TransitChart() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-charcoal/10 dark:border-gold/10">
            <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-3 pr-4">
              Line
            </th>
            <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-3 pr-4">
              Station
            </th>
            <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-3 pr-4">
              Walk
            </th>
            <th className="text-left font-mono text-xs text-muted dark:text-[#7A7264] uppercase tracking-wider py-3">
              Distance
            </th>
          </tr>
        </thead>
        <tbody>
          {ctaLines.map((line) => (
            <tr key={line.name} className="border-b border-charcoal/5 dark:border-gold/5 last:border-0">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="font-medium text-charcoal dark:text-[#F0ECE3]">{line.name}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-muted dark:text-[#C4BDA8]">{line.station}</td>
              <td className="py-3 pr-4 text-muted dark:text-[#C4BDA8]">{line.walkTime}</td>
              <td className="py-3 text-muted dark:text-[#C4BDA8]">{line.distance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
