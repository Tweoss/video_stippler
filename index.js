'use strict';

const TOTAL_POINTS = 6000;

let video = document.querySelector("video");
video.addEventListener('loadedmetadata', () => {

    let canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
    let width = canvas.width = video.videoWidth;
    let height = canvas.height = video.videoHeight;
    let px_square_per_point = (width * height) / TOTAL_POINTS,
        cell_side_length = Math.sqrt(px_square_per_point);

    let trigger = document.querySelector("h1");
    trigger.innerText = "Click me! (sound on)";
    trigger.onclick = (e) => {
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
        let imgData;
        let selection = d3.selectAll("circle");


        function loop() {
            context.drawImage(video, 0, 0);
            imgData = context.getImageData(0, 0, width, height).data;

            document.querySelectorAll("circle").forEach(e => {
                let cumulated_weight = 0;
                let x = e.cx.baseVal.value;
                let y = e.cy.baseVal.value;
                for (let i = Math.floor(x - cell_side_length / 2); i < Math.floor(x + cell_side_length / 2); i++) {
                    for (let j = Math.floor(y - cell_side_length / 2); j < Math.floor(y + cell_side_length / 2); j++) {
                        let index = j * width + i;
                        cumulated_weight += imgData[index * 4] ? imgData[index * 4] : 0;
                    }
                };
                let r = cumulated_weight * 4 / 3 / 255 * 5 / px_square_per_point;
                if (Math.abs(r - e.r.baseVal.value) > 0.1) {
                    e.setAttribute("r", cumulated_weight * 4 / 3 / 255 * 5 / px_square_per_point);
                }

            });

            if (!video.ended) {
                requestAnimationFrame(loop);
            } else {
                // set each circle to an average RGB for its cell
                let img = document.querySelector("img");
                context.drawImage(img, 0, 0, width, height);
                let imgData = context.getImageData(0, 0, width, height).data;
                let temp = new Float32Array(selection.size() * 3);

                selection
                    .each((d, el_index) => {
                        for (let i = Math.floor(d.x - cell_side_length / 2); i < Math.floor(d.x + cell_side_length / 2); i++) {
                            for (let j = Math.floor(d.y - cell_side_length / 2); j < Math.floor(d.y + cell_side_length / 2); j++) {
                                let index = (j * width + i);
                                if (index < imgData.length) {
                                    temp[el_index * 3] += imgData[index * 4];
                                    temp[el_index * 3 + 1] += imgData[index * 4 + 1];
                                    temp[el_index * 3 + 2] += imgData[index * 4 + 2];
                                }
                            }
                        }
                    })
                let colorData = new Uint8ClampedArray(temp.map(d => Math.floor(d / (cell_side_length * cell_side_length))));
                temp = [];
                selection
                    .transition()
                    .duration(() => { return 2000; })
                    .attr("fill", (d, i) => {
                        return "rgb(" + colorData[i * 3] + "," + colorData[i * 3 + 1] + "," + colorData[i * 3 + 2] + ")";
                    });

            }
        };
        loop();
    };
})
