var flag_heartbeat = 0;
var flag_emotion = 0;
var flag_operation = 0;
var flag_set = 0;
var flag_dashboard = 0;

var processSet;

var emotionRelated;
var operationSet;
var timeLength;
var heartbeatNum;
var heartbeatObj;

var stateUrl = "http://127.0.0.1:8000/api/states/";
var emotionUrl = 'http://127.0.0.1:8000/api/emotions/';
var opUrl = "http://127.0.0.1:8000/api/operationtimes/"
var hbUrl = "http://127.0.0.1:8000/api/heartbeats/";
$("#btnRedirect ").click(function() {
    $("#home,#features,footer,#cover").fadeOut();
    $("#main1,.cover-container").css("display", "none");
    $("#new-header").fadeIn();
    $(".ctrl-display").fadeIn();
    $("#dashboardRedirect").addClass("active");
    $("#heartbeat").css("display", "none");
    $("#emotion").css("display", "none");
    $("#operation").css("display", "none");
    $("#set").css("display", "none");
    $("#tips").css("display", "none");

    if (flag_dashboard == 0) {

        processSet = (function() {
            var processUrl = "http://127.0.0.1:8000/api/processes/";
            var processOpenNum = 0;
            var processCloseNum = 0;
            var processCloseList = [];
            var processOpenList = [];

            function getPartData(url, setName, order) {
                var options = {};
                $.ajax({
                    url: url,
                    data: {
                        "clip__clip_outer_id": setName,
                        "ordering": order || ''
                    },
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });
                return options;
            };
            var options = getPartData(processUrl, '1501倪佳慧', '');
            var processNum = options.count;
            options.results.forEach(function(result) {
                if (result.flag == "close") {
                    processCloseNum += 1;
                    processCloseList.push(result.process_name);
                } else {
                    processOpenNum += 1;
                    processOpenList.push(result.process_name);
                }
            });
            return {
                processNum: processNum,
                processCloseNum: processCloseNum,
                processOpenNum: processOpenNum,
                processOpenList: processOpenList,
                processCloseList: processCloseList
            }
        })();

        emotionRelated = (function() {
            var stateList = ['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise', 'NoFace'];
            var posiRate;
            var nofaceRate;
            var negaRate;
            var stateNum = 0;
            var positiveNum = 0;
            var negativeNum = 0;
            var nofaceNum = 0;


            function getPartData(url, state, setName, order) {
                var options = {};
                $.ajax({
                    url: url,
                    data: {
                        "state": state || '',
                        "clip__clip_outer_id": setName,
                        "ordering": order || ''
                    },
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });
                return options;
            };

            stateList.forEach(function(state) {
                var options = getPartData(emotionUrl, state, '1501倪佳慧', '');
                stateNum += options.count;
                if (state == "NoFace") {
                    nofaceNum += options.count;
                } else if (state == "anger" || state == "fear" || state == "sadness" || state == "disgust") {
                    negativeNum += options.count;
                } else {
                    positiveNum += options.count;
                }
            });
            posiRate = (positiveNum * 100 / stateNum).toFixed(2) + "%";
            nofaceRate = (nofaceNum * 100 / stateNum).toFixed(2) + "%";
            negaRate = (negativeNum * 100 / stateNum).toFixed(2) + "%";
            return {
                stateNum: stateNum,
                posiNum: positiveNum,
                negaNum: negativeNum,
                posiRate: posiRate,
                nofaceNum: nofaceNum,
                nofaceRate: nofaceRate,
                negaRate: negaRate
            }
        })();

        operationSet = (function() {
            var operationUrl = "http://127.0.0.1:8000/api/operations/?clip__clip_outer_id=1501倪佳慧"


            function getPartData(url) {
                var options = {};
                $.ajax({
                    url: url,
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });
                return options;
            };
            var options = getPartData(operationUrl);
            // operation_num = ;
            // mouse_num = ;
            // keyboard_num = options.keypressed_num;
            var option = options.results[0]
            return {
                operation_num: option.alloperation_num,
                mouse_num: option.mouseclicked_num,
                keyboard_num: option.keypressed_num,
                content: option.content
            }
        })();

        timeLength = (function() {
            var timeLength;
            (function() {
                var options = getPartData(emotionUrl, '', '1501倪佳慧', 'time');
                var firstTime = options.results[0].time;
                var firstTmpType = new Date(firstTime);
                var first = firstTmpType.getTime();

                var options = getPartData(emotionUrl, '', '1501倪佳慧', '-time');
                var lastTime = options.results[0].time;
                var lastTmpType = new Date(lastTime);
                var last = lastTmpType.getTime();
                var deviation = last - first;

                function getPartData(url, state, setName, order) {
                    var options = {};
                    $.ajax({
                        url: url,
                        data: {
                            "state": state || '',
                            "clip__clip_outer_id": setName,
                            "ordering": order || ''
                        },
                        success: function(response, status) {
                            options.count = response.count;
                            options.results = response.results;
                            options.next = response.next;
                        },
                        async: false
                    });
                    return options;
                };

                function formatSeconds(value) {
                    var secondTime = parseInt(value / 1000); // 秒
                    var minuteTime = 0; // 分
                    var hourTime = 0; // 小时
                    if (secondTime > 60) { //如果秒数大于60，将秒数转换成整数
                        //获取分钟，除以60取整数，得到整数分钟
                        minuteTime = parseInt(secondTime / 60);
                        //获取秒数，秒数取余，得到整数秒数
                        secondTime = parseInt(secondTime % 60);
                        //如果分钟大于60，将分钟转换成小时
                        if (minuteTime > 60) {
                            //获取小时，获取分钟除以60，得到整数小时
                            hourTime = parseInt(minuteTime / 60);
                            //获取小时后取余的分，获取分钟除以60取佘的分
                            minuteTime = parseInt(minuteTime % 60);
                        }
                    }
                    var result = "" + parseInt(secondTime) + "秒";
                    if (minuteTime > 0) {
                        result = "" + parseInt(minuteTime) + "分" + result;
                    }
                    if (hourTime > 0) {
                        result = "" + parseInt(hourTime) + "小时" + result;
                    }
                    return result;
                };
                timeLength = formatSeconds(deviation);
            })();
            return timeLength;
        })();

        heartbeatNum = (function() {
            var heartbeatUrl = "http://127.0.0.1:8000/api/heartbeats/?format=json&search=1501倪佳慧";
            var count;
            var dataList = [];
            var dateList = [];


            function getPartData(url) {

                var options = {};
                $.ajax({
                    url: url,
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });

                return options;
            };
            var options = getPartData(heartbeatUrl);
            return options.count;
        })();

        $("#timeLength").text(timeLength);
        $("#heartbeatNum").text(heartbeatNum);
        $("#emotionNum").text(emotionRelated.stateNum);
        $("#positiveNum").text(emotionRelated.posiRate);
        $("#negativeNum").text(emotionRelated.negaRate);
        $("#nofaceNum").text(emotionRelated.nofaceRate);
        $("#operationTimes").text(operationSet.operation_num);
        $("#mouseNum").text(operationSet.mouse_num);
        $("#keyboardNum").text(operationSet.keyboard_num);
        $("#processNum").text(processSet.processNum);
        $("#processOpenNum").text(processSet.processOpenNum);
        $("#processCloseNum").text(processSet.processCloseNum);
        $("#username").text("何XX");

        flag_dashboard = 1;
    }

});

$("#dashboardRedirect").click(function(event) {
    (function() {
        event.preventDefault();
        $(".nav-link").removeClass("active");
        $("#dashboardRedirect ").addClass("active");
        $("#dashboard").fadeIn();
        $("#heartbeat").css("display", "none");
        $("#emotion").css("display", "none");
        $("#operation").css("display", "none");
        $("#set").css("display", "none");
        // $("#tips").removeClass("alert-warning").remove("alert-dark").addClass("alert-success");
        $("#tips").css("display", "none");

    })();
});

$("#setRedirect").click(function(event) {
    (function() {
        event.preventDefault();
        $(".nav-link").removeClass("active");
        $("#setRedirect ").addClass("active");
        $("#set").fadeIn();
        $("#heartbeat").css("display", "none");
        $("#emotion").css("display", "none");
        $("#operation").css("display", "none");
        $("#dashboard").css("display", "none");
        // $("#tips").
        $("#title").text("");
        $("#summerize").html("");
        $("#suggestion").html("");
        $("#tips").removeClass("alert-successs").removeClass("alert-warning").addClass("alert-dark").fadeIn();;
    })();
    if (flag_set == 0) {
        var myChart = echarts.init(document.getElementById('set'));
        myChart.showLoading();
        $("#set").ready(function() {

            var dataAll = [];
            var dateList = [];
            var heartbeatList = [];
            var emotionList = [];
            var operationList = [];
            var operationList2 = [];

            flag_set = 1;

            function getPartData(url, setName) {
                var options = {};
                $.ajax({
                    url: url,
                    data: {
                        "clip__clip_outer_id": setName
                    },
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });
                return options;
            };

            var options = getPartData(stateUrl, '1501倪佳慧');
            while (options.next || options.results) {
                options.results.forEach(function(result) {
                    dataAll.push(result);
                });
                options = getPartData(options.next);
            };

            for (var i = 0; i < dataAll.length; i++) {
                var tmp = dataAll[i].time;
                var tmpList = tmp.split(':');
                var timeSection = tmpList[0];
                var secondSection = tmpList[2];
                var hourSection = timeSection.split('T');
                var second = secondSection.split('+')[0];
                var hour = hourSection[1];
                var minute = tmpList[1];
                var simpleTime = hour + ':' + minute + ':' + second;
                dateList.push(simpleTime);
                var tmp2 = dataAll[i];
                if (tmp2.heartbeats <= 130 && tmp2.heartbeats >= 40)
                    heartbeatList.push([simpleTime, tmp2.heartbeats]);
                if (tmp2.emotion != null) {
                    emotionList.push([simpleTime, tmp2.emotion]);
                };
                if (tmp2.operation_num !== 0) {
                    operationList.push([simpleTime, tmp2.operation_num]);
                    operationList2.push(tmp2.operation_num);
                };


            }
            // console.log(emotionList)

            function add(x, y) {
                return x + y;
            }
            var allOperationNum = operationList2.reduce(add);
            // var colors = ['#5793f3', '#d14a61', '#675bba'];

            var option = {
                // color: colors,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                grid: {
                    right: '20%'
                },
                title: {
                    left: 'left',
                    text: '心率、操作、表情同轴图表',
                },
                dataZoom: [{
                    type: 'slider',
                    xAxisIndex: 0,
                    start: 10,
                    end: 30
                }, {
                    type: 'inside',
                    xAxisIndex: 0,
                    start: 10,
                    end: 60
                }, {
                    start: 0,
                    end: 10,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                toolbox: {
                    feature: {
                        dataView: {
                            show: true,
                            readOnly: false
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    }
                },
                legend: {
                    data: ['表情点', '操作数', '心率']
                },
                xAxis: [{
                    type: 'category',
                    axisTick: {
                        alignWithLabel: true
                    },
                    data: dateList
                }],
                yAxis: [{
                    type: 'category',
                    name: '表情点',
                    position: 'left'
                }, {
                    type: 'value',
                    name: '操作数',
                    // min: 0,
                    // max: 200,
                    position: 'right',
                    // offset: 50,,

                    axisLabel: {
                        formatter: '{value} 次'
                    }
                }, {
                    type: 'value',
                    name: '心率',
                    min: 40,
                    max: 150,
                    position: 'right',
                    offset: 50,
                    // axisLine: {
                    //     lineStyle: {
                    //         color: colors[2]
                    //     }
                    // },
                    axisLabel: {
                        formatter: '{value} 次'
                    }
                }],
                series: [{
                    name: '表情点',
                    type: 'scatter',
                    data: emotionList
                }, {
                    name: '操作数',
                    type: 'scatter',
                    yAxisIndex: 1,
                    data: operationList,
                    itemStyle: {
                        color: '#D15500',
                        normal: {
                            opacity: 0.8
                        }
                    },
                    symbolSize: function(val) {
                        return val[1] / allOperationNum * 100;
                    },
                }, {
                    name: '心率',
                    type: 'line',
                    yAxisIndex: 2,
                    data: heartbeatList
                }]
            };
            myChart.setOption(option);
        });
        myChart.hideLoading();
    }
    var title = "此项自由查看";
    var summerize = "以时间为主要度量对齐每一步操作。";
    var suggestion = "";

    $("#title").text(title);
    $("#summerize").html(summerize);
    $("#suggestion").html(suggestion);
});

$("#operationRedirect").click(function(event) {
    (function() {
        event.preventDefault();
        $(".nav-link").removeClass("active");
        $("#operationRedirect").addClass("active")
        $("#operation").fadeIn();
        $("#emotion").css("display", "none");
        $("#dashboard").css("display", "none");
        $("#heartbeat").css("display", "none");
        $("#set").css("display", "none");
        // $("#tips")
        $("#title").text("");
        $("#summerize").html("");
        $("#suggestion").html("");
        $("#tips").removeClass("alert-dark").removeClass("alert-successs").addClass("alert-warning").fadeIn();;
    })();

    if (flag_operation == 0) {
        var myChart = echarts.init(document.getElementById('operation'));
        myChart.showLoading();
        $("#operation").ready(function() {
            var operationUrl = "http://127.0.0.1:8000/api/operationtimes/?operation=4"
            var count;
            var dataAll = [];
            var dataList = [];
            var dateList = [];
            flag_operation = 1;

            function getPartData(url) {
                var options = {};
                $.ajax({
                    url: url,
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });
                return options;
            };
            var options = getPartData(operationUrl);
            while (options.next || options.results) {
                options.results.forEach(function(result) {
                    dataAll.push(result);
                });
                options = getPartData(options.next);
            };
            for (var i = 0; i < dataAll.length; i++) {
                dataList.push(dataAll[i].times);
            };
            for (var i = 0; i < dataAll.length; i++) {
                var tmp = dataAll[i].time;
                var tmpList = tmp.split(':');
                var timeSection = tmpList[0];
                var hourSection = timeSection.split('T');
                var hour = hourSection[1];
                var minute = tmpList[1];
                var simpleTime = hour + ':' + minute;
                dateList.push(simpleTime);
            }
            option = {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                toolbox: {
                    feature: {
                        restore: {},
                        saveAsImage: {}
                    }
                },
                title: {
                    left: 'left',
                    text: '每分钟操作数',
                },
                legend: {
                    data: ['操作次数', ]
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    data: dateList,
                    axisTick: {
                        alignWithLabel: true
                    }
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: '操作次数',
                    type: 'bar',
                    barWidth: '60%',
                    data: dataList
                }]
            };
            myChart.setOption(option);
        });
        myChart.hideLoading();
    }
    var title = "一般";
    var summerize = "在学习过程中，共计进行" + operationSet.operation_num + "次操作；鼠标操作" + operationSet.mouse_num + "次；键盘操作" + operationSet.keyboard_num + "次；用键盘输入以下内容：<br><code>" + operationSet.content + "</code>";
    summerize += "<br>进行" + processSet.processNum + "次进程操作;其中" + processSet.processCloseNum + "次进程关闭操作，关闭了：";
    for (var i = 0; i < processSet.processCloseList.length; i++) {
        summerize += processSet.processCloseList[i] + " ";
    }
    summerize += ";其中" + processSet.processOpenNum + "次进程开启操作，开启了："
    for (var i = 0; i < processSet.processOpenList.length; i++) {
        summerize += processSet.processOpenList[i] + " ";
    }

    summerize += "。";
    var suggestion = "";

    $("#title").text(title);
    $("#summerize").html(summerize);
    $("#suggestion").html(suggestion);
});

$("#heartbeatRedirect").click(function(event) {

    (function() {
        event.preventDefault();
        $(".nav-link").removeClass("active");
        $("#heartbeatRedirect").addClass("active")
        $("#heartbeat").fadeIn();
        $("#emotion").css("display", "none");
        $("#dashboard").css("display", "none");
        $("#operation").css("display", "none");
        $("#set").css("display", "none");
        // $("#tips")
        $("#tips").removeClass("alert-warning").removeClass("alert-dark").addClass("alert-success").fadeIn();;



    })();
    (function() {
        if (flag_heartbeat == 1) {
            var title = "普通";
            var summerize = "整体平均心率" + heartbeatObj.averHeartbeat + "；心率过高占比" + heartbeatObj.overflowHeartbeat + "；心率过低占比" + heartbeatObj.underflowHeartbeat + "。";
            var suggestion = "处于平均心率[0.9,1.1]区间占比大于70%，心态平稳。";
            $("#tips").removeClass("alert-warning").addClass("alert-success");
            $("#title").text(title);
            $("#summerize").html(summerize);
            $("#suggestion").html(suggestion);
        }
    })();

    if (flag_heartbeat == 0) {
        var myChart = echarts.init(document.getElementById('heartbeat'));
        myChart.showLoading();
        var dataList = [];
        var dateList = [];
        $("#heartbeat").ready(function() {

            var heartbeatUrl = "http://127.0.0.1:8000/api/heartbeats/?format=json&search=1501倪佳慧";
            var count;


            flag_heartbeat = 1;

            function getPartData(url) {

                var options = {};
                $.ajax({
                    url: url,
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });

                return options;
            };

            var dataAll = [];
            var options = getPartData(heartbeatUrl);
            while (options.next || options.results) {
                options.results.forEach(function(result) {
                    dataAll.push(result);
                });
                options = getPartData(options.next);
            };
            for (var i = 0; i < dataAll.length; i++) {
                if (dataAll[i].beat_nums <= 130 && dataAll[i].beat_nums >= 40)
                    dataList.push(dataAll[i].beat_nums);
            };
            for (var i = 0; i < dataAll.length; i++) {
                if (dataAll[i].beat_nums <= 130 && dataAll[i].beat_nums >= 40) {
                    var tmp = dataAll[i].time;
                    var tmpList = tmp.split(':');
                    var timeSection = tmpList[0];
                    var secondSection = tmpList[2];
                    var hourSection = timeSection.split('T');
                    var second = secondSection.split('+')[0];
                    var hour = hourSection[1];
                    var minute = tmpList[1];
                    var simpleTime = hour + ':' + minute + ':' + second;
                    dateList.push(simpleTime);
                }
            }

            var option = {
                tooltip: {
                    trigger: 'axis',
                    position: function(pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'left',
                    text: '心率大数据面积图',
                },
                legend: {
                    data: ['心跳数据', ]
                },
                toolbox: {
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: dateList
                },
                yAxis: [{
                    type: 'value',
                    boundaryGap: [0, '100%'],
                    min: 40,
                    max: 150
                }, {
                    type: 'value',
                    name: ''
                }],
                dataZoom: [{
                    type: 'inside',
                    start: 0,
                    end: 10
                }, {
                    start: 0,
                    end: 10,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                series: [{
                    name: '心跳数据',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: {
                        normal: {
                            color: 'rgb(255, 70, 131)'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(255, 158, 68)'
                            }, {
                                offset: 1,
                                color: 'rgb(255, 70, 131)'
                            }])
                        }
                    },
                    data: dataList
                }]
            };


            myChart.setOption(option);
            heartbeatObj = (function() {
                var sum = 0;
                var overflow = 0;
                var underflow = 0;
                dataList.forEach(function(singleData) {
                    sum += singleData;
                });
                var averHeartbeat;
                var underflowHeartbeat;
                var overflowHeartbeat;
                var averHeartbeat = (sum / dataList.length).toFixed(2);
                dataList.forEach(function(singleData) {
                    if (singleData > averHeartbeat * 1.1) {
                        overflow += 1;
                    } else if (singleData < averHeartbeat * 0.9) {
                        underflow += 1;
                    }
                });
                overflowHeartbeat = (overflow * 100 / dataList.length).toFixed(2) + "%";
                underflowHeartbeat = (underflow * 100 / dataList.length).toFixed(2) + "%";
                return {
                    averHeartbeat: averHeartbeat,
                    overflowHeartbeat: overflowHeartbeat,
                    underflowHeartbeat: underflowHeartbeat
                }
            })();
            var title = "普通";
            var summerize = "整体平均心率" + heartbeatObj.averHeartbeat + "；心率过高占比" + heartbeatObj.overflowHeartbeat + "；心率过低占比" + heartbeatObj.underflowHeartbeat + "。";
            var suggestion = "处于平均心率[0.9,1.1]区间占比大于70%，心态平稳。";

            $("#title").text(title);
            $("#summerize").html(summerize);
            $("#suggestion").html(suggestion);

            myChart.hideLoading();
        });

    }

});

$("#emotionRedirect").click(function(event) {
    (function() {
        event.preventDefault();
        $(".nav-link").removeClass("active");
        $("#emotionRedirect").addClass("active");
        $("#emotion").fadeIn();
        $("#heartbeat").css("display", "none");
        $("#dashboard").css("display", "none");
        $("#set").css("display", "none");
        $("#operation").css("display", "none");
        $("#title").text("");
        $("#summerize").html("");
        $("#suggestion").html("");
        $("#tips").removeClass("alert-warning").removeClass("alert-dark").addClass("alert-success").fadeIn();
    })();
    if (flag_emotion == 0) {
        var myChart = echarts.init(document.getElementById("emotion"), 'light');

        myChart.showLoading();
        $("#emotion").ready(function() {

            var stateList = ['', 'anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise', 'NoFace'];
            flag_emotion = 1;

            function getPartData(url, state, setName, order) {
                var options = {};
                $.ajax({
                    url: url,
                    data: {
                        "state": state || '',
                        "clip__clip_outer_id": setName,
                        "ordering": order || ''
                    },
                    success: function(response, status) {
                        options.count = response.count;
                        options.results = response.results;
                        options.next = response.next;
                    },
                    async: false
                });
                return options;
            };
            var stateTimesDict = {};
            stateList.forEach(function(state) {
                var options = getPartData(emotionUrl, state, '1501倪佳慧', '');
                stateTimesDict[state] = options.count;
            });
            var option = {
                title: {
                    text: '情绪状态统计表',
                    x: 'left'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                toolbox: {
                    feature: {
                        restore: {},
                        saveAsImage: {}
                    },
                },
                legend: {
                    orient: 'vertical',
                    left: 'right',
                    top: 'middle',
                    data: ['Noface', 'happiness', 'neutral', 'surprise', 'anger', 'disgust', 'sadness']
                },
                series: [{
                    name: '访问来源',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: [{
                        value: stateTimesDict.NoFace,
                        name: "Noface"
                    }, {
                        value: stateTimesDict.happiness,
                        name: 'happiness'
                    }, {
                        value: stateTimesDict.neutral,
                        name: 'neutral'
                    }, {
                        value: stateTimesDict.surprise,
                        name: 'surprise'
                    }, {
                        value: stateTimesDict.anger,
                        name: 'anger'
                    }, {
                        value: stateTimesDict.disgust,
                        name: 'disgust'
                    }, {
                        value: stateTimesDict.sadness,
                        name: 'sadness'
                    }],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };

            var currentIndex = -1;
            setInterval(function() {
                var dataLen = option.series[0].data.length;
                // 取消之前高亮的图形
                myChart.dispatchAction({
                    type: 'downplay',
                    seriesIndex: 0,
                    dataIndex: currentIndex
                });
                currentIndex = (currentIndex + 1) % dataLen;
                // 高亮当前图形
                myChart.dispatchAction({
                    type: 'highlight',
                    seriesIndex: 0,
                    dataIndex: currentIndex
                });
                // 显示 tooltip
                myChart.dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: currentIndex
                });
            }, 1000);
            myChart.setOption(option);

            myChart.hideLoading();
        });
    }
    var title = "继续保持";
    var summerize = "在" + emotionRelated.stateNum + "帧表情中，积极状态的表情有" + emotionRelated.posiNum + "帧，占比" + emotionRelated.posiRate + "；消极状态的表情有" + emotionRelated.negaNum + "帧，占比" + emotionRelated.negaRate + "；没有识别到人像" + emotionRelated.nofaceNum + "帧，占比" + emotionRelated.nofaceRate + "。<br>积极状态：平静、喜悦、惊讶<br>消极状态：恶心、伤心、生气";
    var suggestion = "积极情绪占比大于75%，认定为比较认真状态。";

    $("#title").text(title);
    $("#summerize").html(summerize);
    $("#suggestion").html(suggestion);
});