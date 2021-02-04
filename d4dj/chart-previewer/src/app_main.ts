enum NoteType {
    Tap1 = "Tap1",
    Tap2 = "Tap2",
    ScratchLeft = "ScratchLeft",
    ScratchRight = "ScratchRight",
    StopStart = "StopStart",
    StopEnd = "StopEnd",
    LongStart = "LongStart",
    LongMiddle = "LongMiddle",
    LongEnd = "LongEnd",
    Slide = "Slide",
}

type NoteData = {
    LaneId: number;
    Type: NoteType;
    Time: number;
    NextId: number;
    Direction: number;
    EffectType: number;
    EffectParameter: number;
};

type SoflanData = {
    Item1: number;
    Item2: number;
    Item3: number;
};

type ChartData = {
    MusicName: string;
    SoflanDataList: SoflanData[];
    BarLineList: number[];
    NoteDataList: NoteData[];
};

class D4DJChartRenderer {
    static readonly TOTAL_WIDTH = 200;
    static readonly LANE_WIDTH = 0.7;
    static readonly X_OFFSET =
        (D4DJChartRenderer.TOTAL_WIDTH -
            D4DJChartRenderer.TOTAL_WIDTH * D4DJChartRenderer.LANE_WIDTH) /
        2;

    static readonly NOTE_HEIGHT = 5;

    private heightPerSec = 500;

    private targetCanvas: HTMLCanvasElement;
    private canvas: HTMLCanvasElement;
    private targetCtx: CanvasRenderingContext2D;
    private ctx: CanvasRenderingContext2D;

    private width: number;
    private height: number;
    private offsetHeight: number;
    private startTime: number;
    private endTime: number;
    private totalDur: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = document.createElement("canvas");
        this.targetCanvas = canvas;

        this.ctx = this.canvas.getContext("2d");
        this.targetCtx = canvas.getContext("2d");
    }

    private clear(): void {
        this.ctx.fillStyle = "rgba(0,0,0,0)";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    private getLaneWidth(): number {
        return (
            (D4DJChartRenderer.TOTAL_WIDTH * D4DJChartRenderer.LANE_WIDTH) / 7
        );
    }

    private fillWithScaleAndOffset(
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        x += D4DJChartRenderer.X_OFFSET;
        width *= D4DJChartRenderer.LANE_WIDTH;

        this.ctx.beginPath();
        this.ctx.moveTo(x - width / 2, y);
        this.ctx.lineTo(x - width / 2, y + height);
        this.ctx.lineTo(x + width / 2, y + height);
        this.ctx.lineTo(x + width / 2, y);
        this.ctx.lineTo(x - width / 2, y);

        this.ctx.fill();
    }

    private fillByTime(
        x: number,
        time: number,
        width: number,
        height: number,
        color: string
    ): void {
        this.ctx.fillStyle = color;

        this.fillWithScaleAndOffset(
            x,
            this.heightPerSec * (this.totalDur - (time - this.startTime)) -
                height +
                this.offsetHeight,
            width,
            height
        );
    }

    private textByTime(
        x: number,
        time: number,
        height: number,
        text: string,
        color: string
    ): void {
        this.ctx.fillStyle = color;
        this.ctx.font = height.toString() + "px Arial";

        this.ctx.fillText(
            text,
            x,
            this.heightPerSec * (this.totalDur - (time - this.startTime)) +
                this.offsetHeight
        );
    }

    private drawBarLines(barLines: number[]): void {
        barLines.forEach((barLine) => {
            this.fillByTime(
                (D4DJChartRenderer.TOTAL_WIDTH / 2) *
                    D4DJChartRenderer.LANE_WIDTH,
                barLine,
                D4DJChartRenderer.TOTAL_WIDTH,
                1,
                "#eeeeee"
            );
            this.textByTime(4, barLine, 9, barLine.toString(), "#eeeeee");
        });
    }

    private drawLanes(): void {
        this.ctx.fillStyle = "#eeeeee";

        for (let i = 0; i < 8; i++) {
            this.fillWithScaleAndOffset(
                this.getLaneWidth() * i,
                0,
                1,
                this.height
            );
        }
    }

    private drawTapNote(note: NoteData): void {
        this.fillByTime(
            this.getLaneWidth() * (note.LaneId + 0.5),
            note.Time,
            this.getLaneWidth() * 0.8,
            D4DJChartRenderer.NOTE_HEIGHT,
            "#00cccc"
        );
    }

    private drawScratchNote(note: NoteData): void {
        this.fillByTime(
            this.getLaneWidth() * (note.LaneId + 0.5),
            note.Time,
            this.getLaneWidth() * 0.8,
            D4DJChartRenderer.NOTE_HEIGHT,
            "#ffcc00"
        );
    }

    private drawHoldNote(note: NoteData): void {
        this.fillByTime(
            this.getLaneWidth() * (note.LaneId + 0.5),
            note.Time,
            this.getLaneWidth() * 0.8,
            D4DJChartRenderer.NOTE_HEIGHT,
            "#eeee00"
        );
    }

    private drawStopNote(note: NoteData): void {
        this.fillByTime(
            this.getLaneWidth() * (note.LaneId + 0.5),
            note.Time,
            this.getLaneWidth() * 0.8,
            D4DJChartRenderer.NOTE_HEIGHT,
            "#ee0000"
        );
    }

    private drawLaserNodes(note: NoteData): void {
        this.fillByTime(
            this.getLaneWidth() * (note.LaneId + 0.5),
            note.Time,
            this.getLaneWidth() * 0.5,
            D4DJChartRenderer.NOTE_HEIGHT * 2,
            "rgb(245, 93, 159)"
        );
    }

    private drawLine(
        start: NoteData,
        end: NoteData,
        width: number,
        color: string,
        heightOffset: number
    ): void {
        let sx =
            this.getLaneWidth() * (start.LaneId + 0.5) +
            D4DJChartRenderer.X_OFFSET;
        let ex =
            this.getLaneWidth() * (end.LaneId + 0.5) +
            D4DJChartRenderer.X_OFFSET;

        let sy =
            this.heightPerSec *
                (this.totalDur - (start.Time - this.startTime)) +
            this.offsetHeight -
            heightOffset;
        let ey =
            this.heightPerSec * (this.totalDur - (end.Time - this.startTime)) +
            this.offsetHeight;

        this.ctx.beginPath();
        this.ctx.moveTo(sx - width / 2, sy);
        this.ctx.lineTo(ex - width / 2, ey);
        this.ctx.lineTo(ex + width / 2, ey);
        this.ctx.lineTo(sx + width / 2, sy);
        this.ctx.lineTo(sx - width / 2, sy);

        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    private drawFlickArrow(note: NoteData): void {
        let x =
            this.getLaneWidth() * (note.LaneId + 0.5) +
            D4DJChartRenderer.X_OFFSET;

        let y =
            this.heightPerSec * (this.totalDur - (note.Time - this.startTime)) +
            this.offsetHeight -
            D4DJChartRenderer.NOTE_HEIGHT;

        let x1 = x + (Math.abs(note.Direction) - 1.5) * (note.Direction > 0 ? 1 : -1) * this.getLaneWidth();
        let x2 = x + (Math.abs(note.Direction) - 1) * (note.Direction > 0 ? 1 : -1) * this.getLaneWidth();

        let y1 = y + D4DJChartRenderer.NOTE_HEIGHT / 2;
        let y2 = y - D4DJChartRenderer.NOTE_HEIGHT / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y2);
        this.ctx.lineTo(x, y1);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineTo(x2, y);
        this.ctx.lineTo(x1, y2);
        this.ctx.lineTo(x, y2);

        this.ctx.fillStyle = "rgba(245, 93, 159, 0.8)";
        this.ctx.fill();
    }

    /**
     * renderChart
     */
    public renderChart(chart: ChartData): void {
        this.startTime = chart.BarLineList[0];
        this.endTime = chart.BarLineList[chart.BarLineList.length - 1];
        this.totalDur = this.endTime - this.startTime;

        this.heightPerSec =
            this.targetCanvas.height /
            (chart.BarLineList[1] - chart.BarLineList[0]) /
            4;

        this.width = D4DJChartRenderer.TOTAL_WIDTH;
        this.height = this.heightPerSec * (this.endTime - this.startTime);

        this.offsetHeight =
            this.targetCanvas.height - (this.height % this.targetCanvas.height);
        this.height += this.offsetHeight;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.clear();
        this.drawLanes();
        this.drawBarLines(chart.BarLineList);

        let longs: NoteData[][] = [];
        let lasers: NoteData[][] = [];
        let stops: NoteData[][] = [];

        // Collect long note data
        chart.NoteDataList.forEach((note, idx) => {
            if (note.NextId != 0) {
                switch (note.Type) {
                    case NoteType.LongMiddle:
                    case NoteType.LongStart:
                        longs.push([note, chart.NoteDataList[note.NextId]]);
                        break;
                    case NoteType.Slide:
                        lasers.push([note, chart.NoteDataList[note.NextId]]);
                        break;
                    case NoteType.StopStart:
                        stops.push([note, chart.NoteDataList[note.NextId]]);
                }
            }
        });

        // Draw lasers
        lasers.forEach((pair: NoteData[]) => {
            this.drawLine(
                pair[0],
                pair[1],
                this.getLaneWidth() * 0.1,
                "rgba(245, 93, 159, 0.8)",
                D4DJChartRenderer.NOTE_HEIGHT * 2
            );
        });

        // Draw holds
        longs.forEach((pair: NoteData[]) => {
            this.drawLine(
                pair[0],
                pair[1],
                this.getLaneWidth() * 0.5,
                "rgba(220, 220, 0, 0.8)",
                D4DJChartRenderer.NOTE_HEIGHT
            );
        });

        // Draw stop
        stops.forEach((pair: NoteData[]) => {
            this.drawLine(
                pair[0],
                pair[1],
                this.getLaneWidth() * 0.5,
                "rgba(220, 0, 0, 0.8)",
                D4DJChartRenderer.NOTE_HEIGHT
            );
        });

        // Draw notes
        chart.NoteDataList.forEach((note) => {
            switch (note.Type) {
                case NoteType.Tap1:
                case NoteType.Tap2:
                    this.drawTapNote(note);
                    break;
                case NoteType.ScratchLeft:
                case NoteType.ScratchRight:
                    this.drawScratchNote(note);
                    break;
                case NoteType.LongEnd:
                case NoteType.LongMiddle:
                case NoteType.LongStart:
                    this.drawHoldNote(note);
                    break;
                case NoteType.StopStart:
                case NoteType.StopEnd:
                    this.drawStopNote(note);
                    break;
                case NoteType.Slide:
                    if(note.Direction != 0)
                        this.drawFlickArrow(note);

                    this.drawLaserNodes(note);
                    break;
            }
        });

        const clips = this.canvas.height / this.targetCanvas.height;
        this.targetCanvas.width = D4DJChartRenderer.TOTAL_WIDTH * clips;

        this.targetCtx.fillStyle = "rgba(0,0,0,0)";
        this.targetCtx.fillRect(
            0,
            0,
            this.targetCanvas.width,
            this.targetCanvas.height
        );

        for (let i = 0; i < clips; i++) {
            this.targetCtx.drawImage(
                this.canvas,
                0,
                this.height - (i + 1) * this.targetCanvas.height,
                D4DJChartRenderer.TOTAL_WIDTH,
                this.targetCanvas.height,
                i * D4DJChartRenderer.TOTAL_WIDTH,
                0,
                D4DJChartRenderer.TOTAL_WIDTH,
                this.targetCanvas.height
            );
        }
    }
}

const cvs: HTMLCanvasElement = document.querySelector("canvas");
const input: HTMLInputElement = document.querySelector("#input");

const renderer = new D4DJChartRenderer(cvs);

let chartData: ChartData = null;

input.addEventListener(
    "change",
    () => {
        const file = input.files[0];

        const reader = new FileReader();

        reader.onload = () => {
            renderer.renderChart(
                JSON.parse(reader.result as string) as ChartData
            );
        };

        reader.readAsText(file, "utf-8");
    },
    false
);
