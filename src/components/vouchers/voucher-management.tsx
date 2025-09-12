import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  XCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  UserCheck
} from 'lucide-react';

interface VoucherManagementProps {
  institutionId: string;
  institutionName: string;
}

interface VoucherRecord {
  id: string;
  code: string;
  value: number;
  learnerCount: number;
  parentName: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  issuedBy: string;
  issuedDate: string;
  redeemedBy?: string;
  redeemedDate?: string;
  expiryDate: string;
  notes?: string;
}

interface VoucherStats {
  totalIssued: number;
  totalRedeemed: number;
  totalActive: number;
  totalExpired: number;
  totalValue: number;
  redeemedValue: number;
  activeValue: number;
  totalLearners: number;
  activeLearners: number;
}

export function VoucherManagement({ institutionId, institutionName }: VoucherManagementProps) {
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<VoucherRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [stats, setStats] = useState<VoucherStats>({
    totalIssued: 0,
    totalRedeemed: 0,
    totalActive: 0,
    totalExpired: 0,
    totalValue: 0,
    redeemedValue: 0,
    activeValue: 0,
    totalLearners: 0,
    activeLearners: 0
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockVouchers: VoucherRecord[] = [
      {
        id: '1',
        code: 'ABCD-EFGH-JKLM-NPQR',
        value: 25,
        learnerCount: 2,
        parentName: 'John Johnson',
        status: 'redeemed',
        issuedBy: 'Principal Smith',
        issuedDate: '2024-01-15T10:30:00Z',
        redeemedBy: 'Parent Johnson',
        redeemedDate: '2024-01-20T14:15:00Z',
        expiryDate: '2024-02-19T14:15:00Z',
        notes: 'Parent payment for January - 2 children'
      },
      {
        id: '2',
        code: 'WXYZ-1234-5678-9ABC',
        value: 15,
        learnerCount: 1,
        parentName: 'Sarah Wilson',
        status: 'active',
        issuedBy: 'Principal Smith',
        issuedDate: '2024-01-18T09:00:00Z',
        expiryDate: 'Pending Redemption',
        notes: 'Special discount voucher - single child'
      },
      {
        id: '3',
        code: 'DEFG-HIJK-LMNO-PQRS',
        value: 40,
        learnerCount: 3,
        parentName: 'Mike Davis',
        status: 'active',
        issuedBy: 'Principal Smith',
        issuedDate: '2024-01-20T11:45:00Z',
        expiryDate: 'Pending Redemption',
        notes: 'Premium package voucher - 3 children'
      },
      {
        id: '4',
        code: 'TUVW-3456-7890-BCDE',
        value: 10,
        learnerCount: 1,
        parentName: 'Lisa Brown',
        status: 'expired',
        issuedBy: 'Principal Smith',
        issuedDate: '2023-12-15T10:30:00Z',
        redeemedDate: '2023-12-20T14:15:00Z',
        expiryDate: '2024-01-19T14:15:00Z',
        notes: 'Old voucher - expired after 30 days'
      },
      {
        id: '5',
        code: 'FGHI-JKLM-NOPQ-RSTU',
        value: 30,
        learnerCount: 2,
        parentName: 'Tom Anderson',
        status: 'cancelled',
        issuedBy: 'Principal Smith',
        issuedDate: '2024-01-22T16:20:00Z',
        expiryDate: 'Pending Redemption',
        notes: 'Cancelled due to error - 2 children'
      }
    ];

    setVouchers(mockVouchers);
    setFilteredVouchers(mockVouchers);
    calculateStats(mockVouchers);
  }, []);

  const calculateStats = (voucherList: VoucherRecord[]) => {
    const stats: VoucherStats = {
      totalIssued: voucherList.length,
      totalRedeemed: voucherList.filter(v => v.status === 'redeemed').length,
      totalActive: voucherList.filter(v => v.status === 'active').length,
      totalExpired: voucherList.filter(v => v.status === 'expired').length,
      totalValue: voucherList.reduce((sum, v) => sum + v.value, 0),
      redeemedValue: voucherList.filter(v => v.status === 'redeemed').reduce((sum, v) => sum + v.value, 0),
      activeValue: voucherList.filter(v => v.status === 'active').reduce((sum, v) => sum + v.value, 0),
      totalLearners: voucherList.reduce((sum, v) => sum + v.learnerCount, 0),
      activeLearners: voucherList.filter(v => v.status === 'active').reduce((sum, v) => sum + v.learnerCount, 0)
    };
    setStats(stats);
  };

  const filterVouchers = () => {
    let filtered = vouchers;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      switch (dateFilter) {
        case '30days':
          filtered = filtered.filter(v => new Date(v.issuedDate) >= thirtyDaysAgo);
          break;
        case '90days':
          filtered = filtered.filter(v => new Date(v.issuedDate) >= ninetyDaysAgo);
          break;
        case 'expiring':
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(v => 
            v.status === 'redeemed' && new Date(v.expiryDate) <= thirtyDaysFromNow
          );
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.issuedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.redeemedBy && v.redeemedBy.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredVouchers(filtered);
  };

  useEffect(() => {
    filterVouchers();
  }, [searchTerm, statusFilter, dateFilter, vouchers]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, icon: Clock, text: 'Active' },
      redeemed: { variant: 'secondary' as const, icon: CheckCircle, text: 'Redeemed' },
      expired: { variant: 'destructive' as const, icon: AlertCircle, text: 'Expired' },
      cancelled: { variant: 'outline' as const, icon: XCircle, text: 'Cancelled' }
    };

    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const exportVouchers = () => {
    const csvContent = [
      ['Code', 'Value', 'Learners', 'Parent Name', 'Status', 'Issued By', 'Issued Date', 'Redeemed By', 'Redeemed Date', 'Expiry Date', 'Notes'],
      ...filteredVouchers.map(v => [
        v.code,
        `R${v.value}`,
        v.learnerCount,
        v.parentName,
        v.status,
        v.issuedBy,
        new Date(v.issuedDate).toLocaleDateString(),
        v.redeemedBy || '',
        v.redeemedDate ? new Date(v.redeemedDate).toLocaleDateString() : '',
        v.expiryDate === 'Pending Redemption' ? 'Pending Redemption' : new Date(v.expiryDate).toLocaleDateString(),
        v.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers_${institutionName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Issued</p>
                <p className="text-2xl font-bold">{stats.totalIssued}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">R{stats.totalValue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vouchers</p>
                <p className="text-2xl font-bold">{stats.totalActive}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Learners</p>
                <p className="text-2xl font-bold">{stats.totalLearners}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Redeemed Value</p>
                <p className="text-xl font-bold text-green-600">R{stats.redeemedValue}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Learners</p>
                <p className="text-xl font-bold text-blue-600">{stats.activeLearners}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired/Cancelled</p>
                <p className="text-xl font-bold text-red-600">{stats.totalExpired + (stats.totalIssued - stats.totalActive - stats.totalRedeemed)}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search vouchers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="redeemed">Redeemed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Date Filter</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="expiring">Expiring Soon (30 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={exportVouchers} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voucher Records</span>
            <Badge variant="secondary">
              {filteredVouchers.length} of {vouchers.length} vouchers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Learners</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Redeemed By</TableHead>
                  <TableHead>Redeemed Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      No vouchers found matching the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-mono text-sm">{voucher.code}</TableCell>
                      <TableCell className="font-semibold">R{voucher.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-blue-600" />
                          <span className="text-sm font-medium">{voucher.learnerCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{voucher.parentName}</TableCell>
                      <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                      <TableCell>{voucher.issuedBy}</TableCell>
                      <TableCell>{new Date(voucher.issuedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{voucher.redeemedBy || '-'}</TableCell>
                      <TableCell>
                        {voucher.redeemedDate 
                          ? new Date(voucher.redeemedDate).toLocaleDateString() 
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {voucher.expiryDate === 'Pending Redemption' ? (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        ) : (
                          new Date(voucher.expiryDate).toLocaleDateString()
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={voucher.notes}>
                        {voucher.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Voucher Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="font-medium">Active Vouchers</p>
              <p className="text-blue-700">{stats.totalActive} vouchers worth R{stats.activeValue}</p>
            </div>
            <div>
              <p className="font-medium">Redeemed Vouchers</p>
              <p className="text-blue-700">{stats.totalRedeemed} vouchers worth R{stats.redeemedValue}</p>
            </div>
            <div>
              <p className="font-medium">Total Learners</p>
              <p className="text-blue-700">{stats.totalLearners} learners across all vouchers</p>
            </div>
            <div>
              <p className="font-medium">Active Learners</p>
              <p className="text-blue-700">{stats.activeLearners} learners with active access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
