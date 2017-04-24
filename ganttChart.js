function ganttChart(config) {

    var data = config.data;
    var ELEMENT = d3.select(config.element),
        CHART_WIDTH = ELEMENT[0][0].offsetWidth,
        CHART_HEIGHT = d3.max([((data.length * 80) + 100), 300]),
        PROGRESSBAR_WIDTH = 200,
        PROGRESSBAR_BOUNDARY = 380,
        EMPTYBLOCK_WIDTH = ((80 * CHART_WIDTH) / 100),
        EMPTYBLOCK_HEIGHT = 150,
        BUTTON_COLOR = '#15bfd8';


    var currentDay = {
        start_date: moment().startOf('day').toDate(),
        end_date: moment().endOf('day').toDate(),
    }


    function goToNext() {
        switch (config.metrics.type) {
            case "yearly":
                config.metrics.year = config.metrics.year + 1;
                break;
            case "overall":
                for (var i = 0; i < config.metrics.years.length; i++) {
                    config.metrics.years[i] = config.metrics.years[i] + config.metrics.years.length;
                };
                break;
            case "sprint":
                break;
            case "monthly":
                config.metrics.month = moment(config.metrics.month, 'MMMM YYYY').add(1, 'months').format('MMMM YYYY');
                break;
            case "quarterly":
                months_count = config.metrics.months.length;
                for (var i = 0; i < months_count; i++) {
                    config.metrics.months[i] = moment(config.metrics.months[i], 'MMMM YYYY').add(months_count, 'months').format('MMMM YYYY');
                };
                break;
        }

        draw('next');
    }

    function goToPrevious() {
        switch (config.metrics.type) {
            case "yearly":
                config.metrics.year = config.metrics.year - 1;
                break;
            case "overall":
                for (var i = 0; i < config.metrics.years.length; i++) {
                    config.metrics.years[i] = config.metrics.years[i] - config.metrics.years.length;
                };
                break;
            case "sprint":
                break;
            case "monthly":
                config.metrics.month = moment(config.metrics.month, 'MMMM YYYY').subtract(1, 'months').format('MMMM YYYY');
                break;
            case "quarterly":
                months_count = config.metrics.months.length;
                for (var i = 0; i < months_count; i++) {
                    config.metrics.months[i] = moment(config.metrics.months[i], 'MMMM').subtract(months_count, 'months').format('MMMM YYYY');
                };
                break;
        }
        draw('previous');
    }

    draw('initial');

    function draw(state) {

        var date_boundary = [];
        var subheader_ranges = [];
        var months = [];
        var header_ranges = [];

        d3.select(config.element)[0][0].innerHTML = "";

        if (config.metrics.type == "monthly") {
            months = [config.metrics.month];
            header_ranges = getMonthsRange(months);
            subheader_ranges = getDaysRange(months);
        } else if (config.metrics.type == "overall") {
            var years = config.metrics.years,
                yearsRange = [];
            years.map(function(year) {
                months = months.concat(getMonthsOftheYear(year))
                yearsRange.push(getYearBoundary(year));
            })
            header_ranges = [{
                name: "Overall View",
                start_date: yearsRange[0].start_date,
                end_date: yearsRange[yearsRange.length - 1].end_date,
            }]
            subheader_ranges = yearsRange;

        } else {
            if (config.metrics.type == "quarterly") {
                months = config.metrics.months;
                subheader_ranges = getMonthsRange(months);
                var year = moment(config.metrics.months[0], 'MMMM YYYY').format('YYYY');


                header_ranges = [{
                    start_date: moment(config.metrics.months[0], 'MMMM YYYY').startOf('month').toDate(),
                    end_date: moment(config.metrics.months[config.metrics.months.length - 1], 'MMMM YYYY').endOf('month').toDate(),
                    name: year,
                }];

            } else if (config.metrics.type == "yearly") {
                months = getMonthsOftheYear(config.metrics.year);
                subheader_ranges = getMonthsRange(months);
                header_ranges = [getYearBoundary(config.metrics.year)];
            } else if (config.metrics.type == "sprint") {
                months = getMonthsOftheYear(config.metrics.year);
                subheader_ranges = config.metrics.cycles;
                header_ranges = [getYearBoundary(config.metrics.year)];

            }

        }

        date_boundary[0] = moment(months[0], 'MMM YYYY').startOf('month').toDate();
        date_boundary[1] = moment(months[months.length - 1], 'MMM YYYY').endOf('month').toDate();


        var margin = { top: 20, right: 50, bottom: 100, left: 50 },
            width = d3.max([CHART_WIDTH, 400]) - margin.left - margin.right,
            height = CHART_HEIGHT - margin.top - margin.bottom;

        var x = d3.time.scale()
            .domain(date_boundary)
            .range([0, width])


        var y = d3.scale.ordinal()
            .rangeRoundBands([0, height], 0.1);

        y.domain(data.map(function(d, i) {
            return i + 1;
        }));

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.time.format("%d/%m/%Y"));

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickSize(0)
            .tickPadding(6);

        var first_section = ELEMENT
            .append('div')
            .attr('class', 'first_section')
            .style("height", 40)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", 40)
            .append('g')

        var second_section = ELEMENT
            .append('div')
            .attr('class', 'second_section')
            .style("height", 40)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", 40)
            .append('g')


        switch (state) {

            case 'initial':
                first_section
                    .attr("transform", "translate( " + margin.left + ", 30)")
                second_section
                    .attr("transform", "translate( " + margin.left + ", 0)")
                break;

            case 'next':
                second_section
                    .attr("transform", "translate( 1000, 0)")
                    .transition()
                    .attr("transform", "translate( " + margin.left + ", 0)")
                first_section
                    .attr("transform", "translate( 1000, 30)")
                    .transition()
                    .attr("transform", "translate( " + margin.left + ", 30)")
                break;

            case 'previous':
                second_section
                    .attr("transform", "translate( -1000, 0)")
                    .transition()
                    .attr("transform", "translate( " + margin.left + ", 0)")
                first_section
                    .attr("transform", "translate( -1000, 30)")
                    .transition()
                    .attr("transform", "translate( " + margin.left + ", 30)")
                break;

        }



        var DRAWAREA = ELEMENT
            .append('div')
            .attr('class', 'draw_area')
            .append("svg")
            .attr('class', 'DRAWAREA')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        var svg = DRAWAREA
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + 0 + ")")
            .call(appendStartLine);

        var lines = svg.append('g').attr("transform", "translate(0,0)")

        var currentDayArea = svg.append('line')
            .attr('width', getActualWidth(currentDay))
            .attr('class', 'CurrentDay-Area')
            .attr("x1", x(new Date(currentDay.start_date)))
            .attr("x2", x(new Date(currentDay.start_date)))
            .attr("y1", 0)
            .attr("y2", height)


        var leftClickableArea = svg.append('rect')
            .attr('width', (width) / 2)
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('click', function() {
                goToPrevious();
                config.onAreaClick('left');
            })

        var rightClickableArea = svg.append('rect')
            .attr('width', (width) / 2)
            .attr("transform", "translate(" + ((width) / 2) + " ,0)")
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('click', function() {
                goToNext();
                config.onAreaClick('right');
            })


        first_section.selectAll(".bar")
            .data(header_ranges)
            .enter().append("text")
            .attr('class', 'first-title')
            .attr('y', -5)
            .attr("x", function(d) {
                return x(new Date(d.start_date)) + (getWidth(d) / 2);
            })
            .attr("width", function(d) {
                return getWidth(d);
            })
            .attr("height", y.rangeBand())
            .text(function(d) {
                return d.name
            });

        second_section
            .append("rect")
            .attr("x", x(new Date(date_boundary[0])))
            .attr("width", Math.abs(x(new Date(date_boundary[0])) - x(new Date(date_boundary[1]))))
            .attr("height", 40)
            .attr('class', 'Date-Block-Outline');


        second_section
            .append('g')
            .selectAll(".bar")
            .data(subheader_ranges)
            .enter()
            .append("rect")
            .attr("x", function(d) {
                return x(new Date(d.start_date))
            })
            .attr("width", function(d) {
                return getWidth(d);
            })
            .attr("height", 40)
            .attr('class', function(d) {
                return "Date-Block Date-" + moment(d.start_date).format("MMYYYY")
            });

        second_section
            .append('g')
            .selectAll(".bar")
            .data(subheader_ranges)
            .enter().append("text")
            .attr("x", function(d) {
                return (x(new Date(d.start_date)) + 10);
            })
            .attr("width", function(d) {
                return getWidth(d);
            })
            .attr('y', 25)
            .text(function(d) {
                return d.name;
            })
            .attr('class', function(d) {
                return "second-title Date Date-" + moment(d).format("MMYYYY")
            });


        lines.selectAll(".lines")
            .data(subheader_ranges)
            .enter()
            .append("line")
            .attr('class', 'date-line')
            .attr("x1", function(d) {
                return x(new Date(d.start_date));
            })
            .attr("x2", function(d) {
                return x(new Date(d.start_date));
            })
            .attr("y1", 0)
            .attr("y2", height)



        if (config.data.length == 0) {
            var EmptyBlockX = ((CHART_WIDTH / 2) - (EMPTYBLOCK_WIDTH / 2)),
                EMPTYBLOCK = DRAWAREA
                .append('g')
                .attr('class', 'EmptyMessageBlock')
                .attr("transform", "translate(" + EmptyBlockX + ", 20)")

            EMPTYBLOCK
                .append('rect')
                .attr('fill', '#fff')
                .attr('stroke', '#ccc')
                .attr('x', 0)
                .attr('width', EMPTYBLOCK_WIDTH)
                .attr('height', EMPTYBLOCK_HEIGHT)

            EMPTYBLOCK
                .append('text')
                .attr('class', 'EmptyMessage')
                .attr('font-size', 25)
                .attr('y', 25)
                .text("There is no objective yet, please click to add one");


            var EMPTRYBLOCK_BUTTON = EMPTYBLOCK
                .append('g')
                .attr('class', 'empty_button')
                .attr("transform", "translate(" + Math.abs((EMPTYBLOCK_WIDTH / 2) - 50) + ", 100)")
                .on('click', function(d) {
                    config.onEmptyButtonClick();
                })

            EMPTRYBLOCK_BUTTON
                .append('rect')
                .attr('width', 100)
                .attr('height', 35)
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('fill', BUTTON_COLOR)

            EMPTRYBLOCK_BUTTON
                .append('text')
                .attr('fill', '#fff')
                .attr('y', 25)
                .attr('x', 10)
                .text("Click Here")

            var textBlock = EMPTYBLOCK.select('.EmptyMessage');

            var EmptyMessageWidth = textBlock.node().getComputedTextLength();
            EmptyMessageX = Math.abs((EMPTYBLOCK_WIDTH / 2) - (EmptyMessageWidth / 2));

            textBlock
                .attr("transform", "translate(" + EmptyMessageX + ",20)")
        }

        var bars = svg.append('g').attr("transform", "translate(0, 20)")

        var Blocks = bars.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")
            .attr('class', 'Single--Block cp')
            .attr("transform", function(d, i) {
                return "translate(" + x(new Date(d.start_date)) + "," + 0 + ")";
            })
            .call(appendBar)

        Blocks
            .append('g')
            .attr('transform', function(d) {
                if (startsBefore(d) && isVisible(d)) {
                    var position = Math.abs(x(new Date(d.start_date)));
                    return "translate(" + position + ", 0)";
                } else {
                    return "translate(0, 0)";
                }
            })
            .call(appendTitle)
            .call(appendFooter)

        Blocks
            .on('click', function(d) {
                config.onClick(d);
            })
            .on('mouseover', function(d, i) {
                svg.selectAll('.Single--Block')
                    .style('opacity', function(b, i) {
                        return (d.id == b.id) ? 1 : 0.3;
                    })

                svg.selectAll('.start-lines, .end-lines')
                    .style('stroke-width', function(b, i) {
                        return (d.id == b.id) ? 3 : 1;
                    })
                    .style('opacity', function(b, i) {
                        return Number(d.id == b.id);
                    })

                svg.selectAll('.Single--Node')
                    .attr("width", function(b) {
                        if (d.id == b.id) {
                            if (startsBefore(d) || endsAfter(d)) {
                                if (getWidth(b) < 500) {
                                    return (getActualWidth(b) + (500 - getWidth(b)) + 10)
                                }
                            }
                            return ((d3.max([getActualWidth(b), 500])) + 10);
                        } else {
                            return getActualWidth(b)
                        }
                    })

                svg.selectAll('.ProgressBar')
                    .attr('opacity', function(b) {
                        return Number(d.id == b.id || getWidth(b) > 480)
                    })

                svg.selectAll('.Duration')
                    .attr('opacity', function(b) {
                        return Number(d.id == b.id || getWidth(b) > 200)
                    })

                svg.selectAll('.TermType')
                    .attr('opacity', function(b) {
                        return Number(d.id == b.id || getWidth(b) > 80)
                    })

                second_section.selectAll(".Date")
                    .style('fill', function(b, i) {
                        if (moment(b.start_date, "MM/DD/YYYY").isBetween(d.start_date, d.end_date, 'days') || moment(b.end_date, "MM/DD/YYYY").isBetween(d.start_date, d.end_date, 'days'))
                            return '#4894ff';

                    })
                second_section.selectAll(".Date-Block")
                    .style('fill', function(b, i) {
                        if (moment(b.start_date, "MM/DD/YYYY").isBetween(d.start_date, d.end_date, 'days') || moment(b.end_date, "MM/DD/YYYY").isBetween(d.start_date, d.end_date, 'days'))
                            return '#f0f6f9';

                    })

                d3.select(this).selectAll('.Title')
                    .text(function(d) {
                        return d.title
                    })

                d3.select(this).each(function(d, i) {
                    var width = ((d3.max([getWidth(d), 500])) + 10);
                    trimTitle(width, this, config.box_padding * 2)
                })
            })
            .on('mouseout', function(d, i) {
                svg.selectAll('.Single--Block')
                    .style('opacity', 1)
                svg.selectAll('.start-lines, .end-lines')
                    .style('stroke-width', 1)
                    .style('opacity', 1)

                svg.selectAll('.Single--Node')
                    .attr("width", function(b) {
                        return (getActualWidth(b) + 10);
                    })

                svg.selectAll('.ProgressBar')
                    .attr('opacity', function(b) {
                        return Number(getWidth(b) > PROGRESSBAR_BOUNDARY)
                    })

                svg.selectAll('.Duration')
                    .attr('opacity', function(b) {
                        return Number(getWidth(b) > 200)
                    })

                svg.selectAll('.TermType')
                    .attr('opacity', function(b) {
                        return Number(getWidth(b) > 80)
                    })
                second_section.selectAll(".Date")
                    .style('fill', '')
                second_section.selectAll(".Date-Block")
                    .style('fill', '')

                d3.select(this).each(function(d, i) {
                    var width = getWidth(d);
                    trimTitle(width, this, config.box_padding * 2)
                })
            })
            .each(function(d, i) {
                var width = getWidth(d);
                trimTitle(width, this, config.box_padding * 2)
            })


        function appendBar(d, i) {
            this.append('rect')
                .attr('class', 'Single--Node')
                .attr('rx', 5)
                .attr('ry', 5)
                .attr("height", 60)
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return y(i + 1);
                })
                .attr("width", function(d) {
                    return (getActualWidth(d) + 10);
                })
        }

        function appendTitle(d, i) {
            this.append('text')
                .attr('class', 'Title')
                .attr("x", config.box_padding)
                .attr("y", function(d, i) {
                    return (y(i + 1) + 20)
                })
                .text(function(d) {
                    return d.title
                })
        }

        function appendFooter(d, i) {
            var footer = this.append('g')
                .attr("transform", function(d, i) {
                    var position = config.box_padding;
                    if (position < 10) {
                        position = 0;
                    }
                    return "translate(" + position + ", " + (y(i + 1) + 45) + ")";
                })
                .call(renderTerm)
                .call(renderDuration)
                .call(appendProgressBar)
        }

        function appendProgressBar(d, i) {
            this.append('rect')
                .attr('class', 'ProgressBar')
                .attr('fill', '#ddd')
                .attr('width', PROGRESSBAR_WIDTH)

            this.append('rect')
                .attr('class', 'ProgressBar ProgressBar-Fill')
                .attr('fill', 'red')
                .attr('width', function(d) {
                    var width = ((d.completion_percentage * PROGRESSBAR_WIDTH) / 100);
                    return width;
                })

            this.selectAll('.ProgressBar')
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('y', -7)
                .attr('height', 7)
                .attr('x', 180)
                .attr('opacity', function(d) {
                    var width = getWidth(d);
                    return Number(width > PROGRESSBAR_BOUNDARY)
                })
        }

        function appendStartLine() {
            this.selectAll(".start-lines")
                .data(data)
                .enter()
                .append("line")
                .attr('class', 'start-lines')
                .attr('stroke', function(d) {
                    return d.color
                })
                .attr("x1", function(d) {
                    return x(new Date(d.start_date)) + 10;
                })
                .attr("x2", function(d) {
                    return x(new Date(d.start_date)) + 10;
                })
                .attr("y1", 0)
                .attr("y2", function(d, i) {
                    return (y(i + 1) + 20);
                })

            this.selectAll(".end-lines")
                .data(data)
                .enter()
                .append("line")
                .attr('stroke', function(d) {
                    return d.color
                })
                .attr('class', 'end-lines')
                .attr("x1", function(d) {
                    return x(new Date(d.end_date)) + 5;
                })
                .attr("x2", function(d) {
                    return x(new Date(d.end_date)) + 5;
                })
                .attr("y1", 0)
                .attr("y2", function(d, i) {
                    return (y(i + 1) + 20);
                })

        }

        function renderTerm(d, i) {
            this.append('text')
                .attr('class', 'TermType')
                .text(function(d) {
                    return d.term
                })
                .attr('opacity', function(d) {
                    return Number(getWidth(d) > 80)
                })
        }

        function renderDuration(d, i) {
            this.append('text')
                .attr('class', 'Duration')
                .attr('x', 80)
                .text(function(d) {
                    return getDuration(d)
                })
                .attr('opacity', function(d) {
                    return Number(getWidth(d) > 200)
                })
        }

        // function type(d) {
        //     d.value = +d.value;
        //     return d;
        // }

        function getDuration(d) {
            var start_date = moment(d.start_date, "MM/DD/YYYY").format("DD MMM"),
                end_date = moment(d.end_date, "MM/DD/YYYY").format("DD MMM");
            duration = start_date + " - " + end_date;
            return duration;
        }

        function trimTitle(width, node, padding) {

            var textBlock = d3.select(node).select('.Title')

            var textLength = textBlock.node().getComputedTextLength(),
                text = textBlock.text()
            while (textLength > (width - padding) && text.length > 0) {
                text = text.slice(0, -1);
                textBlock.text(text + '...');
                textLength = textBlock.node().getComputedTextLength();
            }
        }

        function getWidth(node) {
            if (endsAfter(node)) {
                width = Math.abs(x(new Date(date_boundary[1])) - x(new Date(node.start_date)));
            } else if (startsBefore(node)) {
                width = Math.abs(x(new Date(date_boundary[0])) - x(new Date(node.end_date)));
            } else {
                width = getActualWidth(node);
            }
            return width;
        }

        function getActualWidth(node) {
            return Math.abs(x(new Date(node.end_date)) - x(new Date(node.start_date)));
        }

        function startsBefore(node) {
            return moment(node.start_date, "MM/DD/YYYY").isBefore(date_boundary[0])
        }

        function endsAfter(node) {
            return moment(node.end_date, "MM/DD/YYYY").isAfter(date_boundary[1]);
        }

        function isVisible(node) {
            var start_date_visible = moment(node.start_date, "MM/DD/YYYY").isBetween(date_boundary[0], date_boundary[1], 'days'),
                end_date_visible = moment(node.end_date, "MM/DD/YYYY").isBetween(date_boundary[0], date_boundary[1], 'days');

            return start_date_visible || end_date_visible;

        }

        function getDaysRange(months) {
            ranges = [];
            months.map(function(month) {
                var startOfMonth = moment(month, 'MMM YYYY').startOf('month')
                var endOfMonth = moment(month, 'MMM YYYY').endOf('month')
                var day = startOfMonth;

                while (day <= endOfMonth) {
                    ranges.push({
                        name: moment(day).format('DD'),
                        start_date: day.toDate(),
                        end_date: day.clone().add(1, 'd').toDate(),
                    });
                    day = day.clone().add(1, 'd');
                }
            });
            return ranges;
        }

        function getMonthsRange(months) {
            ranges = [];
            months.map(function(month) {
                var startOfMonth = moment(month, 'MMM YYYY').startOf('month')
                var endOfMonth = moment(month, 'MMM YYYY').endOf('month')

                ranges.push({
                    name: moment(startOfMonth).format('MMMM'),
                    start_date: startOfMonth.toDate(),
                    end_date: endOfMonth.clone().add(1, 'd').toDate(),
                });


            });

            return ranges;
        }

        function getYearBoundary(year) {
            var yearDate = moment(year, 'YYYY');
            startOfYear = moment(yearDate).startOf('year');
            endOfYear = moment(yearDate).endOf('year');

            return {
                name: year,
                start_date: startOfYear.toDate(),
                end_date: endOfYear.toDate(),
            };
        }

        function getMonthsOftheYear(year) {
            var months = moment.months();
            months = months.map(function(month) {
                month = month + " " + year;
                return month;
            });
            return months;
        }

    }
}
