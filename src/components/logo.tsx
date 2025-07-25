import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("h-6 w-6", className)}
    >
      <path
        fill="currentColor"
        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm60-92a56,56,0,0,1-96.63,40.23l-3.37,20.24a4,4,0,0,1-7.85-1.31l12-72a4,4,0,0,1,7.7.88l-7.3,43.8a48,48,0,1,1,54.12-45.14,4,4,0,1,1,4.56-6.48A56.07,56.07,0,0,1,188,124Z"
      />
    </svg>
  );
}
