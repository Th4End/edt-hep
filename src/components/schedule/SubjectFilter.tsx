import { useId, useState, useEffect } from "react";
import { Checkbox, Card, CardContent, CardHeader, CardTitle, Divider } from "@/lib";
import { Filter, ChevronDown, Laptop } from "lucide-react";
import type { SubjectFilterProps } from "@/types/schedule";

const SubjectFilter = ({
  subjects,
  selectedSubjects,
  onToggle,
  remoteFilter,
  onToggleRemote,
  defaultOpen = false,
}: SubjectFilterProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const contentId = useId();
  const allSelected = selectedSubjects.size === subjects.length;
  const [isMounted, setIsMounted] = useState<boolean>(defaultOpen);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultOpen);

  const handleSelectAll = () => {
    subjects.forEach((subject) => {
      if (!allSelected && !selectedSubjects.has(subject)) {
        onToggle(subject);
      } else if (allSelected && selectedSubjects.has(subject)) {
        onToggle(subject);
      }
    });
  };

  useEffect(() => {
    let openTimer: ReturnType<typeof setTimeout> | null = null;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    if (isOpen) {
      // Monter immédiatement, puis développer à la prochaine tick pour déclencher la transition
      setIsMounted(true);
      openTimer = setTimeout(() => setIsExpanded(true), 20);
    } else {
      // Replier d'abord, puis démonter après la transition
      setIsExpanded(false);
      closeTimer = setTimeout(() => setIsMounted(false), 300);
    }

    return () => {
      if (openTimer) clearTimeout(openTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [isOpen]);

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="p-6">
        <label className="flex items-center justify-between cursor-pointer">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtres
          </CardTitle>

          <button
            name="toggle-button"
            aria-expanded={isOpen ? "true" : "false"}
            aria-controls={contentId}
            onClick={() => setIsOpen((s) => !s)}
            className="p-1 rounded hover:bg-muted transition-transform"
            title={isOpen ? "Fermer les filtres" : "Ouvrir les filtres"}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </label>
      </CardHeader>

        {/* Contenu repliable avec transition fluide lors du montage/démontage */}
      {isMounted && (
        <CardContent id={contentId} className="space-y-3">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
            aria-hidden={!isExpanded}
          >
            {/* Sélecteur distanciel */}
            <div className="flex items-center space-x-2 pb-2">
              <Checkbox
                id="distanciel"
                checked={filterDistanciel}
                onCheckedChange={onToggleDistanciel}
              />
              <label
                htmlFor="distanciel"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
              >
                <Laptop className="w-4 h-4 text-primary" />
                  Distanciel uniquement
              </label>
            </div>
          {/* Sélecteur distanciel */}
          <div className="flex items-center space-x-2 pb-2 border-b border-border">
            <Checkbox
              id="distanciel"
              checked={remoteFilter}
              onCheckedChange={onToggleRemote}
            />
            <label
              htmlFor="distanciel"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
            >
              <Laptop className="w-4 h-4 text-primary" />
              Distanciel only
            </label>
          </div>

            <Divider />

            {/* Sélecteur matières */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {subjects.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject}
                    checked={selectedSubjects.has(subject)}
                    onCheckedChange={() => onToggle(subject)}
                  />
                  <label
                    htmlFor={subject}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {subject}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SubjectFilter;
