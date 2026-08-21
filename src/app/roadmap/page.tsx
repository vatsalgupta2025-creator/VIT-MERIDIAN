import AiRoadmap from '@/components/AiRoadmap';

export default function RoadmapPage() {
    return (
        <div className="h-full relative overflow-hidden bg-[#0A0D15]">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
            <div className="relative z-10 h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-8">
                <AiRoadmap />
            </div>
        </div>
    );
}
