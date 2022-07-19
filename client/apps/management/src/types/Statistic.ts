export type StatisticListType = {
    list: StatisticType[];
    count: number;
    limit: number;
};

export type StatisticType = {
    timeValue: number;
    statisticValue: number;
};
