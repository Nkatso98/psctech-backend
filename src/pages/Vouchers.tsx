import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { PageHeader } from '@/components/ui/page-header';
import { PageTransition } from '@/components/ui/page-transition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, BarChart3, Settings } from 'lucide-react';
import { VoucherGenerator } from '@/components/vouchers/voucher-generator';
import { VoucherRedemption } from '@/components/vouchers/voucher-redeemer';
import { VoucherManagement } from '@/components/vouchers/voucher-management';

export default function VouchersPage() {
  const { user, institution } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');

  // Use actual institution data from auth context
  const currentInstitution = institution || {
    id: 'inst_001',
    name: 'Sample Primary School',
    code: 'SAMPLE001'
  };

  const canGenerateVouchers = user?.role === 'Principal' || user?.role === 'Superadmin';
  const canManageVouchers = user?.role === 'Principal' || user?.role === 'Superadmin';
  const canRedeemVouchers = user?.role === 'Parent' || user?.role === 'Learner' || !user;

  const getPageTitle = () => {
    if (user?.role === 'Principal' || user?.role === 'Superadmin') {
      return 'Voucher Management';
    } else if (user?.role === 'Parent' || user?.role === 'Learner') {
      return 'Redeem Voucher';
    }
    return 'Voucher System';
  };

  const getPageDescription = () => {
    if (user?.role === 'Principal' || user?.role === 'Superadmin') {
      return 'Generate, manage, and track vouchers for your institution';
    } else if (user?.role === 'Parent' || user?.role === 'Learner') {
      return 'Redeem your voucher to activate dashboard access';
    }
    return 'Access the voucher system to manage or redeem vouchers';
  };

  const getBreadcrumbs = () => {
    const base = [{ name: 'Vouchers', href: '/vouchers' }];
    
    if (user?.role === 'Principal' || user?.role === 'Superadmin') {
      return [
        { name: 'Dashboard', href: '/dashboard' },
        ...base
      ];
    } else if (user?.role === 'Parent' || user?.role === 'Learner') {
      return [
        { name: 'Dashboard', href: '/dashboard' },
        ...base
      ];
    }
    
    return base;
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <PageHeader
          title={getPageTitle()}
          description={getPageDescription()}
          breadcrumbs={getBreadcrumbs()}
        />

        {/* Institution Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="h-5 w-5" />
              Institution Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Institution Name</p>
                <p className="font-semibold">{currentInstitution.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Institution Code</p>
                <p className="font-semibold">{currentInstitution.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium">User Role</p>
                <Badge variant="outline" className="capitalize">
                  {user?.role || 'Guest'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-based Content */}
        {canGenerateVouchers || canManageVouchers ? (
          // Principal/Admin Dashboard
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Generate Vouchers
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Manage Vouchers
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <VoucherGenerator
                institutionId={currentInstitution.institutionId || currentInstitution.id}
                institutionName={currentInstitution.name}
              />
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <VoucherManagement
                institutionId={currentInstitution.institutionId || currentInstitution.id}
                institutionName={currentInstitution.name}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voucher System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Allowed Denominations</label>
                      <div className="flex flex-wrap gap-2">
                        {[5, 10, 15, 20, 25, 30, 35, 40, 45].map(value => (
                          <Badge key={value} variant="secondary">
                            R{value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Voucher Expiry</label>
                      <p className="text-sm text-gray-600">36 months from issue date</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      These settings are configured at the system level and cannot be changed by individual institutions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : canRedeemVouchers ? (
          // Parent/Learner Redemption
          <div className="space-y-6">
            <VoucherRedemption
              institutionId={currentInstitution.institutionId || currentInstitution.id}
              institutionName={currentInstitution.name}
            />
          </div>
        ) : (
          // No Access
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Access Restricted</CardTitle>
            </CardHeader>
            <CardContent className="text-red-800">
              <p>
                You don't have permission to access the voucher system. 
                Please contact your institution administrator for access.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Information Footer */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">About the Voucher System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">For Principals & Administrators</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Generate vouchers in denominations from R5 to R45</li>
                  <li>• Track voucher status and redemption history</li>
                  <li>• Export voucher data for reporting</li>
                  <li>• Monitor voucher usage and revenue</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">For Parents & Learners</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Redeem vouchers to activate dashboard access</li>
                  <li>• View redemption history and status</li>
                  <li>• Access full educational dashboard features</li>
                  <li>• Secure and instant activation</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Security Note:</strong> All vouchers are cryptographically secured and can only be used once. 
                Lost or stolen vouchers cannot be replaced. Vouchers are valid for 36 months from issue date.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

