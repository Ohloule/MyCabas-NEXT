type CarouselIndicatorProps = {
  current: number;
  count: number;
};
export default function CarouselIndicator({
  current,
  count,
}: CarouselIndicatorProps) {
  return (
    <div className="flex justify-center mt-4 md:mt-8 mb-24 space-x-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${
            current === index+1
              ? index % 2 === 0
                ? "bg-principale-700 scale-125"
                : "bg-secondaire-700 scale-125"
              : index % 2 === 0
              ? "bg-principale-300"
              : "bg-secondaire-300"
          }`}
        />
      ))}
    </div>
  );
}

/* current === index+1
              ? "bg-principale-700 scale-125"
              : "bg-principale-300" */
