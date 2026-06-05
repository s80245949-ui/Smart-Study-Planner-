import * as React from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, Target, Award, CheckCircle2 } from "lucide-react";
import { useStatsOverviewData, useWeeklyStatsData, useStatsByCategoryData } from "@/hooks/use-stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const COLORS = ['hsl(260, 100%, 65%)', 'hsl(280, 100%, 65%)', 'hsl(200, 100%, 50%)', 'hsl(30, 100%, 60%)'];

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useStatsOverviewData();
  const { data: weeklyStats, isLoading: weeklyLoading } = useWeeklyStatsData();
  const { data: categoryStats, isLoading: categoryLoading } = useStatsByCategoryData();

  const completionRate = stats ? Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100) : 0;
  
  const productivityScore = stats ? Math.min(100, Math.round(
    (stats.completedTasks * 10) + 
    (stats.streakDays * 5) + 
    (stats.todayCompleted * 15) - 
    (stats.overdueTasks * 20)
  )) : 0;

  return (
    <div className="space-y-8 pb-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stats & Productivity</h1>
        <p className="text-muted-foreground mt-1">Track your progress and celebrate your consistency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80 flex items-center gap-2">
                <Award className="h-4 w-4" /> Productivity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-10 w-20 bg-primary-foreground/20" /> : (
                <div className="text-4xl font-bold">{Math.max(0, productivityScore)}<span className="text-xl text-primary-foreground/60 ml-1">/100</span></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Overall Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-10 w-20" /> : (
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-bold">{completionRate}%</div>
                  <div className="text-sm text-muted-foreground pb-1">{stats?.completedTasks} / {stats?.totalTasks} tasks</div>
                </div>
              )}
              <Progress value={completionRate} className="h-1.5 mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" /> Longest Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-10 w-20" /> : (
                <div className="text-4xl font-bold">{stats?.streakDays || 0} <span className="text-xl text-muted-foreground font-normal">Days</span></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Tasks created vs completed over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {weeklyLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="dayName" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="created" name="Created" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.3} />
                  <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
            <CardDescription>Distribution of all your tasks</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-0">
            {categoryLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-48 h-48 rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {categoryStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', textTransform: 'capitalize' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '14px', textTransform: 'capitalize' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
