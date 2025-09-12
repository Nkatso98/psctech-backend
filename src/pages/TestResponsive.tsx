import React from 'react';
import { ResponsiveLayout } from '@/components/layout/responsive-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UsersIcon, 
  BookOpenIcon, 
  CheckCircleIcon,
  FileTextIcon,
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  TargetIcon,
  ClipboardListIcon,
  AlertCircleIcon,
  MegaphoneIcon,
  SchoolIcon,
  TrophyIcon
} from 'lucide-react';

export default function TestResponsive() {
  return (
    <ResponsiveLayout userRole="Principal">
      <div className="space-y-6">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold tracking-tight text-center lg:text-left">
            Responsive Design Test
          </h1>
          <p className="text-muted-foreground text-center lg:text-left mt-2">
            Test the responsive layout and mobile-first design
          </p>
        </div>

        {/* Responsive Grid Test */}
        <div className="dashboard-grid-mobile">
          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Card 1</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="stat-value">1,234</div>
              <p className="stat-label">Test description</p>
              <div className="stat-change positive">+12 from last week</div>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Card 2</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="stat-value">45</div>
              <p className="stat-label">Test description</p>
              <div className="stat-change positive">+2 new items</div>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Card 3</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="stat-value">3.2%</div>
              <p className="stat-label">Test description</p>
              <div className="stat-change positive">-0.5% change</div>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Card 4</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="stat-value">12</div>
              <p className="stat-label">Test description</p>
              <div className="stat-change">Completed items</div>
            </CardContent>
          </Card>
        </div>

        {/* Responsive Buttons Test */}
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle>Responsive Buttons</CardTitle>
            <CardDescription>Test mobile-optimized button styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button className="btn-mobile btn-primary w-full sm:w-auto">
                Primary Button
              </Button>
              <Button className="btn-mobile btn-secondary w-full sm:w-auto">
                Secondary Button
              </Button>
              <Button variant="outline" className="btn-mobile w-full sm:w-auto">
                Outline Button
              </Button>
              <Button variant="ghost" className="btn-mobile w-full sm:w-auto">
                Ghost Button
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Form Test */}
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle>Responsive Form</CardTitle>
            <CardDescription>Test mobile-optimized form elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group-mobile">
              <label className="form-label-mobile">Full Name</label>
              <input 
                type="text" 
                className="form-control-mobile" 
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group-mobile">
              <label className="form-label-mobile">Email Address</label>
              <input 
                type="email" 
                className="form-control-mobile" 
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group-mobile">
              <label className="form-label-mobile">Message</label>
              <textarea 
                className="form-control-mobile" 
                rows={4}
                placeholder="Enter your message"
              />
            </div>
            <Button className="btn-mobile btn-primary w-full sm:w-auto">
              Submit Form
            </Button>
          </CardContent>
        </Card>

        {/* Responsive Table Test */}
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle>Responsive Table</CardTitle>
            <CardDescription>Test mobile-optimized table layout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="table-responsive-mobile">
              <table className="table-mobile w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="Name">John Doe</td>
                    <td data-label="Role">Teacher</td>
                    <td data-label="Status">Active</td>
                    <td data-label="Actions">
                      <Button size="sm" variant="outline">Edit</Button>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Name">Jane Smith</td>
                    <td data-label="Role">Principal</td>
                    <td data-label="Status">Active</td>
                    <td data-label="Actions">
                      <Button size="sm" variant="outline">Edit</Button>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Name">Bob Johnson</td>
                    <td data-label="Role">Student</td>
                    <td data-label="Status">Inactive</td>
                    <td data-label="Actions">
                      <Button size="sm" variant="outline">Edit</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Utilities Test */}
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle>Responsive Utilities</CardTitle>
            <CardDescription>Test mobile-specific utility classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="d-mobile-block lg:hidden bg-blue-100 p-2 rounded">
                This is visible on mobile only
              </div>
              <div className="hidden lg:block bg-green-100 p-2 rounded">
                This is visible on desktop only
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-mobile-center lg:text-left">
                <p>This text is centered on mobile, left-aligned on desktop</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex-mobile-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
                <Button size="sm">Button 1</Button>
                <Button size="sm">Button 2</Button>
                <Button size="sm">Button 3</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Images Test */}
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle>Responsive Images</CardTitle>
            <CardDescription>Test mobile-optimized image handling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img 
                src="https://via.placeholder.com/400x200/3b82f6/ffffff?text=Responsive+Image" 
                alt="Responsive test image"
                className="img-mobile-fluid"
              />
              <p className="text-sm text-muted-foreground">
                This image is full-width on mobile and auto-sized on desktop
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading States Test */}
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Test mobile-optimized loading indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="loading-mobile">
              <div className="loading-spinner-mobile"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}
