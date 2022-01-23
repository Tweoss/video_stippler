'use strict';

const TOTAL_POINTS = 6000,
    TIME_INTERVAL = 400;

let video = document.querySelector("video");
console.log(video)
video.onloadeddata = () => {

    let canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
    let width = canvas.width = video.videoWidth;
    let height = canvas.height = video.videoHeight;
    let grayscaleData = new Uint8ClampedArray(width * height);
    let px_square_per_point = (width * height) / TOTAL_POINTS,
        cell_side_length = Math.sqrt(px_square_per_point);

    document.querySelector("h1").onclick = (e) => {
        e.preventDefault();
        e.target.style.display = "none";
        let svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("background-color", "black");

        for (let i = 0; i < width; i += cell_side_length) {
            for (let j = 0; j < height; j += cell_side_length) {
                svg.append("circle")
                    .datum({ x: i + cell_side_length / 2, y: j + cell_side_length / 2 })
                    .attr("cx", i + cell_side_length / 2)
                    .attr("cy", j + cell_side_length / 2)
                    .attr("r", cell_side_length / 2)
                    .attr("fill", "white")
                    .attr("stroke", "none");
            }
        }

        video.play();

        function loop() {
            context.drawImage(video, 0, 0);
            let imgData = context.getImageData(0, 0, width, height).data;

            d3.selectAll("circle")
                .transition()
                .duration((d, _) => {
                    return TIME_INTERVAL;
                    // return TIME_INTERVAL * Math.random();
                })
                .attr("r", (d, i) => {
                    let cumulated_weight = 0;
                    for (let i = Math.floor(d.x - cell_side_length / 2); i < Math.floor(d.x + cell_side_length / 2); i++) {
                        for (let j = Math.floor(d.y - cell_side_length / 2); j < Math.floor(d.y + cell_side_length / 2); j++) {
                            let index = j * width + i;
                            cumulated_weight += Math.round(j * width + i) < grayscaleData.length ?
                                ( /*1 - */ (imgData[index * 4] + imgData[index * 4 + 1] + imgData[index * 4 + 2]) / 3 / 255) * 10 / px_square_per_point :
                                0;
                        }
                    }
                    return cumulated_weight;
                });
            if (!video.ended) {
                setTimeout(loop, TIME_INTERVAL)
            }
        };
        loop();
    };


}