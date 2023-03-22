import React, { useEffect } from "react";
import Layout from "../layout";

import { Paper, Slider } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";

import {
    useGetMessageStatisticByHourQuery,
    useGetMessageStatisticByDayQuery,
} from "../../api/message";
import moment from "moment";

function valuetext(value: number) {
    return `${value}bababaa`;
}

export default function Dashboard() {
    var tzoffset = new Date().getTimezoneOffset() * 60000;
    let [startHour, setStartHour] = React.useState<Date>(moment().subtract(1, "day").toDate());
    let [endHour, setEndHour] = React.useState<Date>(new Date(Date.now() - tzoffset));

    let [modifiedStartHour, setModifiedStartHour] = React.useState<Date>(
        moment().subtract(1, "day").toDate()
    );
    let [modifiedEndHour, setModifiedEndHour] = React.useState<Date>(
        new Date(Date.now() - tzoffset)
    );

    let [startDay, setStartDay] = React.useState<Date>(moment().subtract(1, "month").toDate());
    let [endDay, setEndDay] = React.useState<Date>(new Date(Date.now() - tzoffset));

    let [modifiedStartDay, setModifiedStartDay] = React.useState<Date>(
        moment().subtract(1, "month").toDate()
    );
    let [modifiedEndDay, setModifiedEndDay] = React.useState<Date>(new Date(Date.now() - tzoffset));
    const hourMarks = [];
    for (var i = 0; i < 25; i++) {
        hourMarks.push({
            value: i,
            label: moment()
                .subtract(24 - i, "hour")
                .hour(),
        });
    }

    const dayMarks = [];
    for (var i = 0; i < 31; i++) {
        const value = 30 - i;
        const currentMoment = moment().subtract(value, "days").format("DD/MM");
        console.log(currentMoment);
        if (dayMarks.length < 31) {
            dayMarks.push({
                value: i,
                label: currentMoment,
            });
        }
    }
    const { data: statisticsHourData, isLoading: statisticsHourDataIsLoading } =
        useGetMessageStatisticByHourQuery({
            startHour: parseInt(modifiedStartHour.getTime().toFixed(0)),
            endHour: parseInt(modifiedEndHour.getTime().toFixed(0)),
        });

    const { data: statisticsDayData, isLoading: statisticsDayDataIsLoading } =
        useGetMessageStatisticByDayQuery({
            startDay: parseInt(modifiedStartDay.getTime().toFixed(0)),
            endDay: parseInt(modifiedEndDay.getTime().toFixed(0)),
        });

    const [hourValue, setHourValue] = React.useState<number[]>([0, 24]);
    const [dayValue, setDayValue] = React.useState<number[]>([0, 30]);

    const handleHourChange = (event: Event, newValue: number | number[]) => {
        const sliderValues: number[] = newValue as number[];
        if (sliderValues.length > 1) {
            setHourValue(sliderValues);
        }
    };

    const handleDayChange = (event: Event, newValue: number | number[]) => {
        const sliderValues: number[] = newValue as number[];
        if (sliderValues.length > 1) {
            setDayValue(sliderValues);
        }
    };
    useEffect(() => {
        (async () => {
            if (!statisticsHourDataIsLoading) {
                // console.log("Statistics: " + JSON.stringify(statisticsHourData.list));
            }
        })();
    }, [statisticsHourData, statisticsDayData]);

    useEffect(() => {
        (async () => {
            const minValue = hourValue[0];
            const maxValue = hourValue[1];
            modifiedStartHour.setHours(startHour.getHours() + minValue);
            modifiedEndHour.setHours(endHour.getHours() + (maxValue - 24));
            setModifiedStartHour(modifiedStartHour);
            setModifiedEndHour(modifiedEndHour);
        })();
    }, [hourValue]);

    return (
        <Layout subtitle="Dashboard">
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                    height: "300px",
                }}
            >
                {statisticsHourData ? (
                    <ResponsiveLine
                        data={statisticsHourData.list}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: "point" }}
                        yScale={{
                            type: "linear",
                            min: 0,
                            max: "auto",
                            stacked: true,
                            reverse: false,
                        }}
                        yFormat=" >-.2f"
                        pointSize={10}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "hour",
                            legendOffset: 36,
                            legendPosition: "middle",
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "messages",
                            legendOffset: -40,
                            legendPosition: "middle",
                        }}
                        pointColor={{ theme: "background" }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: "serieColor" }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: "bottom-right",
                                direction: "column",
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: "left-to-right",
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: "circle",
                                symbolBorderColor: "rgba(0, 0, 0, .5)",
                                effects: [
                                    {
                                        on: "hover",
                                        style: {
                                            itemBackground: "rgba(0, 0, 0, .03)",
                                            itemOpacity: 1,
                                        },
                                    },
                                ],
                            },
                        ]}
                    />
                ) : null}
                <Slider
                    getAriaLabel={() => "Statistic range"}
                    value={hourValue}
                    onChange={handleHourChange}
                    valueLabelDisplay="off"
                    getAriaValueText={valuetext}
                    step={1}
                    marks={hourMarks}
                    min={0}
                    max={24}
                />
            </Paper>
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                    height: "300px",
                }}
            >
                {statisticsDayData ? (
                    <ResponsiveLine
                        data={statisticsDayData.list}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: "point" }}
                        yScale={{
                            type: "linear",
                            min: 0,
                            max: "auto",
                            stacked: true,
                            reverse: false,
                        }}
                        yFormat=" >-.2f"
                        pointSize={10}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "day",
                            legendOffset: 36,
                            legendPosition: "middle",
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "messages",
                            legendOffset: -40,
                            legendPosition: "middle",
                        }}
                        pointColor={{ theme: "background" }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: "serieColor" }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: "bottom-right",
                                direction: "column",
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: "left-to-right",
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: "circle",
                                symbolBorderColor: "rgba(0, 0, 0, .5)",
                                effects: [
                                    {
                                        on: "hover",
                                        style: {
                                            itemBackground: "rgba(0, 0, 0, .03)",
                                            itemOpacity: 1,
                                        },
                                    },
                                ],
                            },
                        ]}
                    />
                ) : null}
                <Slider
                    getAriaLabel={() => "Statistic range"}
                    value={dayValue}
                    onChange={handleDayChange}
                    valueLabelDisplay="off"
                    getAriaValueText={valuetext}
                    step={1}
                    marks={dayMarks}
                    min={0}
                    max={30}
                />
            </Paper>
        </Layout>
    );
}
