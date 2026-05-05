import { Navigation } from "@/components/Navigation";

const LocatiesOverview = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-7 pt-14 pb-24">
        <h1
          className="font-fraunces font-normal text-ink"
          style={{ fontSize: "44px", lineHeight: 1.1 }}
        >
          Plekjes in 2800
        </h1>
      </main>
    </div>
  );
};

export default LocatiesOverview;
