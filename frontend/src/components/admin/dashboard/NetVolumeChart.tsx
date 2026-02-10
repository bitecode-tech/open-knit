import type {ChartData, ChartOptions} from "chart.js";
import {CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, TimeScale, Tooltip,} from "chart.js";
import "chartjs-adapter-date-fns";
import {Line} from "react-chartjs-2";
import {useEffect, useState} from "react";

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend,
    Filler,
    CategoryScale
);

interface VolumePoint {
    x: Date;
    y: number;
}

export const NetVolumeChart = ({duration}: { duration: number }) => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 0, 0);

    const [fullPoints, setFullPoints] = useState<VolumePoint[]>([]);
    const [visiblePoints, setVisiblePoints] = useState<VolumePoint[]>([]);

    // Generate points once
    useEffect(() => {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const points: VolumePoint[] = [];
        for (let h = 0; h <= now.getHours(); h++) {
            const time = new Date(startOfDay);
            time.setHours(h);
            points.push({x: time, y: Math.random() * 50 + 20});
        }
        points.push({x: now, y: Math.random() * 50 + 20});
        setFullPoints(points);
    }, []);

    // Animate reveal using requestAnimationFrame with interpolation
    useEffect(() => {
        if (fullPoints.length === 0) return;

        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const visibleCount = fullPoints.length * progress;
            const sliced = fullPoints.slice(0, Math.floor(visibleCount));

            // Smooth interpolation for the in-between point
            if (visibleCount > 1 && visibleCount < fullPoints.length) {
                const prev = fullPoints[Math.floor(visibleCount) - 1];
                const next = fullPoints[Math.floor(visibleCount)];
                const frac = visibleCount % 1;
                const interpolated: VolumePoint = {
                    x: new Date(prev.x.getTime() + frac * (next.x.getTime() - prev.x.getTime())),
                    y: prev.y + frac * (next.y - prev.y),
                };
                sliced.push(interpolated);
            }

            setVisiblePoints(sliced);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [fullPoints]);

    const chartData: ChartData<"line", VolumePoint[], Date> = {
        datasets: [
            {
                label: "Net Volume",
                data: visiblePoints,
                borderColor: "#8b5cf6",
                backgroundColor: "#8b5cf6",
                fill: false,
                pointRadius: 0,
                tension: 0.4,
                spanGaps: true,
            },
        ],
    };

    const chartOptions: ChartOptions<"line"> = {
        responsive: true,
        animation: false,
        scales: {
            x: {
                type: "time",
                min: dayStart.getTime(),
                max: dayEnd.getTime(),
                time: {
                    unit: "minute",
                    displayFormats: {minute: "HH:mm"},
                },
                ticks: {
                    maxTicksLimit: 25,
                    callback: (val: string | number) => {
                        const date = new Date(val);
                        const h = date.getHours();
                        const m = date.getMinutes();
                        if (h % 4 === 0 && m === 0) return `${h.toString().padStart(2, "0")}:00`;
                        if (h === 23 && m === 59) return "23:59";
                        return "";
                    },
                },
                afterBuildTicks: (axis) => {
                    const ticks = [];
                    for (let h = 0; h <= 23; h += 4) {
                        const tick = new Date(dayStart);
                        tick.setHours(h, 0, 0, 0);
                        ticks.push(tick.getTime());
                    }
                    const tick2359 = new Date(dayStart);
                    tick2359.setHours(23, 59, 0, 0);
                    // @ts-ignore
                    axis.ticks = [...ticks, tick2359.getTime()].map((v) => ({value: v}));
                },
                grid: {
                    drawTicks: true,
                    color: (ctx) => {
                        const val = ctx.tick?.value;
                        if (!val) return "transparent";
                        const d = new Date(val);
                        const h = d.getHours();
                        const m = d.getMinutes();
                        return (m === 0 || (h === 23 && m === 59))
                            ? "rgba(200,200,200,0.3)"
                            : "transparent";
                    },
                },
            },
            y: {
                min: -30,
                max: 130,
                display: false,
                grid: {display: false},
                ticks: {display: false},
            },
        },
        plugins: {
            legend: {display: false},
            tooltip: {
                mode: "nearest",
                intersect: false,
                callbacks: {
                    label: (ctx) => `Net Volume: ${ctx.parsed.y.toFixed(2)}`,
                },
            },
        },
    };

    return <Line className="mt-1 max-h-[350px]" data={chartData} options={chartOptions}/>;
};
