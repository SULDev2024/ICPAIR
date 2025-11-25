import React, { useEffect, useState } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import NotificationService from "../services/NotificationService";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid, ResponsiveContainer
} from 'recharts';

// A layout with a dark, sleek "Monitoring Station" aesthetic
const ChartBlock = ({ title, data, color, colorId, t }) => {
    // --- LOGGING TO MATCH YOUR SCREENSHOT ---
    // This prints: "ChartBlock Уровень PM2.5 Value: [...]"
    console.log(`ChartBlock Уровень ${title}:`, data);

    const latestValue = data && data.length > 0 ? data[data.length - 1].value : '--';
    const gradientId = `gradient-${colorId}`;

    if (!data || data.length === 0) {
        return (
            <div style={styles.card}>
                <div style={styles.loadingWrapper}>
                    <h3 style={styles.cardTitle}>{title}</h3>
                    <div style={styles.loader}>Analyze...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <div>
                    <div style={styles.iconRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            <line x1="10" y1="1" x2="21" y2="12" />
                            <line x1="21" y1="1" x2="21" y2="7" />
                            <line x1="21" y1="1" x2="15" y2="1" />
                        </svg>
                        <span style={styles.subLabel}>{t('sensor_data')}</span>
                    </div>
                    <h3 style={styles.cardTitle}>{title}</h3>
                </div>

                <div style={styles.liveValueContainer}>
                    <div style={styles.liveIndicator}>
                        <div style={{ ...styles.pulsingDot, backgroundColor: color }}></div>
                        <span style={{ color: color, fontSize: '10px', fontWeight: 'bold' }}>{t('live')}</span>
                    </div>
                    <div style={styles.bigNumber}>
                        {latestValue} <span style={styles.unit}>µg/m³</span>
                    </div>
                </div>
            </div>

            <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderColor: '#334155',
                                color: '#f1f5f9',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: color }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div >
    );
};

const styles = {
    wrapper: {
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'transparent',
        padding: '2px',
        minHeight: '50vh',
        fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
        borderRadius: '16px'
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        border: '1px solid #334155',
        overflow: 'hidden',
        position: 'relative'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    iconRow: { display: 'flex', alignItems: 'center', marginBottom: '6px' },
    subLabel: { fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '1px' },
    cardTitle: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#f1f5f9' },
    liveValueContainer: { textAlign: 'right' },
    liveIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' },
    pulsingDot: { width: '6px', height: '6px', borderRadius: '50%', marginRight: '6px', boxShadow: '0 0 8px currentColor' },
    bigNumber: { fontSize: '28px', fontWeight: '800', color: '#ffffff', lineHeight: 1 },
    unit: { fontSize: '12px', fontWeight: '400', color: '#94a3b8' },
    chartContainer: { height: '130px', width: '100%' },
    loadingWrapper: { height: '230px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748b' },
    loader: { marginTop: '10px', fontSize: '12px', letterSpacing: '1px' }
};

export default function PMCharts({ deviceId }) {
    const { t } = useLanguage();
    const [pm25Data, setPm25Data] = useState([]);
    const [pm10Data, setPm10Data] = useState([]);

    useEffect(() => {
        const generateData = () => {
            // --- LOGGING START ---
            console.log('Generating chart data...');
            // ---------------------

            const testData = [
                { date: '00:00', value: 45 }, { date: '02:00', value: 52 },
                { date: '04:00', value: 38 }, { date: '06:00', value: 67 },
                { date: '08:00', value: 89 }, { date: '10:00', value: 76 },
                { date: '12:00', value: 94 }, { date: '14:00', value: 82 },
                { date: '16:00', value: 71 }, { date: '18:00', value: 58 },
                { date: '20:00', value: 49 }, { date: '22:00', value: 42 }
            ];

            const pm25TestData = testData.map(item => ({
                ...item,
                value: Math.floor(Math.random() * 150) + 10
            }));

            const pm10TestData = testData.map(item => ({
                ...item,
                value: Math.floor(Math.random() * 200) + 20
            }));

            // --- LOGGING DATA ARRAYS ---
            console.log('PM2.5 test data:', pm25TestData);
            console.log('PM10 test data:', pm10TestData);
            // ---------------------------

            setPm25Data(pm25TestData);
            setPm10Data(pm10TestData);
        };

        generateData();

        const interval = setInterval(generateData, 10000);
        return () => clearInterval(interval);
    }, [deviceId]);

    // Monitor PM levels and send notifications
    useEffect(() => {
        if (pm25Data.length > 0 && pm10Data.length > 0) {
            const latestPM25 = pm25Data[pm25Data.length - 1].value;
            const latestPM10 = pm10Data[pm10Data.length - 1].value;

            // Check if levels are unhealthy and send notification
            NotificationService.checkPMLevel(latestPM25, latestPM10, "Current Location");
        }
    }, [pm25Data, pm10Data]);

    return (
        <div style={styles.wrapper}>
            <ChartBlock
                title={t('pm25_value')}
                data={pm25Data}
                color="#38bdf8"
                colorId="cyan"
                t={t}
            />
            <ChartBlock
                title={t('pm10_value')}
                data={pm10Data}
                color="#34d399"
                colorId="green"
                t={t}
            />
        </div>
    );
}