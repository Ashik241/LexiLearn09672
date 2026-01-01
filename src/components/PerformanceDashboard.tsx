'use client';

import { useVocabulary } from '@/hooks/use-vocabulary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart, FileWarning, TrendingDown, TrendingUp, BookCheck } from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useRouter } from 'next/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Button } from './ui/button';
import Link from 'next/link';

const COLORS = ['#FF8042', '#00C49F', '#0088FE']; // Orange (Spelling), Green (Meaning), Blue (Grammar)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-lg shadow-lg">
        <p className="label font-bold">{`${payload[0].name} : ${payload[0].value}`}</p>
        <p className="intro text-muted-foreground">{`(${(payload[0].percent * 100).toFixed(2)}%)`}</p>
      </div>
    );
  }
  return null;
};

function ErrorDistributionChart() {
    const { stats } = useVocabulary();
    const { spelling, meaning, grammar } = stats.errorStats;
    const totalErrors = spelling + meaning + grammar;
    
    const chartConfig = {
      errors: {
        label: "Errors",
      },
      spelling: {
        label: "Spelling",
        color: "hsl(var(--chart-1))",
      },
      meaning: {
        label: "Meaning",
        color: "hsl(var(--chart-2))",
      },
      grammar: {
        label: "Grammar",
        color: "hsl(var(--chart-3))",
      },
    }

    const data = [
        { name: 'Spelling Errors', value: spelling, fill: 'hsl(var(--chart-1))' },
        { name: 'Meaning Errors', value: meaning, fill: 'hsl(var(--chart-2))' },
        { name: 'Grammar Errors', value: grammar, fill: 'hsl(var(--chart-3))' },
    ].filter(d => d.value > 0);

    if(totalErrors === 0){
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <BarChart className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground mt-4">এখনও কোনো ভুল রেকর্ড করা হয়নি।</p>
                <p className="text-xs text-muted-foreground">শেখা শুরু করুন!</p>
            </div>
        )
    }

    return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                    );
                }}
            >
            </Pie>
             <Legend />
            </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
}

function HardestWordsList() {
    const { getAllWords } = useVocabulary();
    const router = useRouter();

    const hardestWords = useMemo(() => {
        const words = getAllWords();
        return words
            .map(w => ({...w, totalErrors: (w.spelling_error || 0) + (w.meaning_error || 0) + (w.grammar_error || 0) }))
            .filter(w => w.totalErrors > 0)
            .sort((a, b) => b.totalErrors - a.totalErrors)
            .slice(0, 5);
    }, [getAllWords]);

    if (hardestWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <FileWarning className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground mt-4">এখনও কোনো কঠিন শব্দ নেই।</p>
                <p className="text-xs text-muted-foreground">চালিয়ে যান!</p>
            </div>
        )
    }
    
    const handleRowClick = (wordId: string) => {
        router.push(`/vocabulary?word=${encodeURIComponent(wordId)}`);
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead className="text-right">Total Errors</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {hardestWords.map(word => (
                    <TableRow key={word.id} onClick={() => handleRowClick(word.id)} className="cursor-pointer">
                        <TableCell className="font-medium font-code">{word.word}</TableCell>
                        <TableCell className="text-right font-bold">{word.totalErrors}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function ProgressGraph() {
     // This is placeholder data. A real implementation would fetch this from historical stats.
    const data = [
        { name: 'Day -6', errors: 12 },
        { name: 'Day -5', errors: 15 },
        { name: 'Day -4', errors: 10 },
        { name: 'Day -3', errors: 11 },
        { name: 'Day -2', errors: 7 },
        { name: 'Day -1', errors: 5 },
        { name: 'Today', errors: 3 },
    ];
    
    const isTrendingDown = data[data.length - 1].errors < data[0].errors;
    const TrendIcon = isTrendingDown ? TrendingDown : TrendingUp;
    const trendColor = isTrendingDown ? 'text-green-500' : 'text-red-500';

    const chartConfig = {
      errors: {
        label: "Errors",
        color: "hsl(var(--chart-1))",
      },
    };

    return (
        <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Line type="monotone" dataKey="errors" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--chart-1))"}} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}


export function PerformanceDashboard() {
  const { isInitialized } = useVocabulary();

  if (!isInitialized) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
                <CardDescription>আপনার ভুলের ধরন অনুযায়ী বিতরণ।</CardDescription>
            </CardHeader>
            <CardContent>
                <ErrorDistributionChart />
            </CardContent>
        </Card>
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Top 5 Hardest Words</CardTitle>
                <CardDescription>সবচেয়ে বেশি ভুল করা শব্দগুলো।</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <HardestWordsList />
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/learn?difficulty=Hard">
                        <BookCheck className="mr-2 h-4 w-4" />
                        Exam
                    </Link>
                </Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>7-Day Progress</CardTitle>
                <CardDescription>বিগত ৭ দিনে আপনার ভুলের প্রবণতা।</CardDescription>
            </CardHeader>
            <CardContent>
                <ProgressGraph />
            </CardContent>
        </Card>
    </div>
  );
}
