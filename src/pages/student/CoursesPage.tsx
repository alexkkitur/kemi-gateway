import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockCourses } from '@/lib/mock-data';
import { Search, Clock, Users, Banknote, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const filtered = mockCourses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Available Courses</h1>
            <p className="text-sm text-muted-foreground mt-1">Browse and register for training programmes</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(course => (
            <Card key={course.id} className="shadow-card border hover:shadow-elevated transition-shadow group animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="text-xs font-medium">{course.category}</Badge>
                  <span className="text-xs text-muted-foreground">{course.startDate}</span>
                </div>
                <CardTitle className="font-heading text-base mt-2 leading-snug">{course.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.enrolled}/{course.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Banknote className="h-3.5 w-3.5" />
                    <span>KES {course.fee.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-4">
                  <div
                    className="h-1.5 rounded-full gradient-primary transition-all"
                    style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                  />
                </div>
                <Button className="w-full gradient-primary text-primary-foreground group-hover:shadow-md transition-shadow" size="sm">
                  Apply Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
