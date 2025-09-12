import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileTextIcon, 
  DownloadIcon,
  UploadIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  LockIcon,
  GlobeIcon,
  StarIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Documents() {
  const { user, institution } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [selectedCategory, selectedType]);

  const loadDocuments = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockDocuments();
      setDocuments(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockDocuments = () => {
    const categories = ['Academic', 'Administrative', 'Financial', 'Policy', 'Reports'];
    const types = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Image'];
    const titles = [
      'Student Handbook 2024-2025',
      'Academic Calendar',
      'Fee Structure',
      'Attendance Policy',
      'Examination Guidelines',
      'Library Rules',
      'Sports Policy',
      'Transportation Guidelines',
      'Parent Communication Protocol',
      'Emergency Procedures'
    ];
    
    const mockDocuments = [];
    for (let i = 1; i <= 30; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const size = Math.floor(Math.random() * 5000) + 100; // 100KB - 5MB
      const downloads = Math.floor(Math.random() * 200) + 10;
      const isPublic = Math.random() > 0.3;
      const isStarred = Math.random() > 0.7;
      
      mockDocuments.push({
        id: i.toString(),
        title: `${title} ${i}`,
        category,
        type,
        size,
        downloads,
        isPublic,
        isStarred,
        uploadedBy: `User ${Math.floor(Math.random() * 5) + 1}`,
        uploadedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `This document contains important information about ${title.toLowerCase()}. It is essential for all stakeholders to review and understand the contents.`,
        tags: [category, type, 'Important'],
        version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
        status: Math.random() > 0.2 ? 'Active' : 'Draft'
      });
    }
    return mockDocuments;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileTextIcon className="h-5 w-5 text-red-600" />;
      case 'Word': return <FileTextIcon className="h-5 w-5 text-blue-600" />;
      case 'Excel': return <FileTextIcon className="h-5 w-5 text-green-600" />;
      case 'PowerPoint': return <FileTextIcon className="h-5 w-5 text-orange-600" />;
      case 'Image': return <FileTextIcon className="h-5 w-5 text-purple-600" />;
      default: return <FileTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Administrative': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Financial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Policy': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Reports': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (selectedCategory !== 'All' && doc.category !== selectedCategory) return false;
    if (selectedType !== 'All' && doc.type !== selectedType) return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !doc.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const exportDocuments = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Category,Type,Size,Downloads,Uploaded By,Upload Date,Status\n" +
      filteredDocuments.map(row => `${row.title},${row.category},${row.type},${formatFileSize(row.size)},${row.downloads},${row.uploadedBy},${row.uploadedDate},${row.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `documents_${selectedCategory}_${selectedType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleStar = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId ? { ...doc, isStarred: !doc.isStarred } : doc
      )
    );
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
              <p className="text-muted-foreground">
                Access and manage school documents at {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'Principal' && (
                <Button onClick={() => setShowUploadForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              )}
              <Button variant="outline" onClick={exportDocuments}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                <DownloadIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.reduce((sum, doc) => sum + doc.downloads, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public Documents</CardTitle>
                <GlobeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(doc => doc.isPublic).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Starred</CardTitle>
                <StarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {documents.filter(doc => doc.isStarred).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Document Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Policy">Policy</SelectItem>
                      <SelectItem value="Reports">Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">File Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Word">Word</SelectItem>
                      <SelectItem value="Excel">Excel</SelectItem>
                      <SelectItem value="PowerPoint">PowerPoint</SelectItem>
                      <SelectItem value="Image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                  {getTypeIcon(doc.type)}
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-medium">{doc.title}</h3>
                                    <Badge className={getCategoryColor(doc.category)}>
                                      {doc.category}
                                    </Badge>
                                    {!doc.isPublic && (
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <LockIcon className="h-3 w-3" />
                                        Private
                                      </Badge>
                                    )}
                                    {doc.isStarred && (
                                      <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {doc.description}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <UserIcon className="h-4 w-4" />
                                      {doc.uploadedBy}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="h-4 w-4" />
                                      {new Date(doc.uploadedDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DownloadIcon className="h-4 w-4" />
                                      {doc.downloads} downloads
                                    </span>
                                    <span>v{doc.version}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="text-right text-sm text-muted-foreground">
                                  <div>{formatFileSize(doc.size)}</div>
                                  <div>{doc.type}</div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleStar(doc.id)}
                                  >
                                    <StarIcon className={`h-4 w-4 ${doc.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <DownloadIcon className="h-4 w-4" />
                                  </Button>
                                  {user?.role === 'Principal' && (
                                    <>
                                      <Button size="sm" variant="outline">
                                        <EditIcon className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <TrashIcon className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {filteredDocuments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No documents found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Uploaded</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Recent documents will appear here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="starred" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Starred Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Starred documents will appear here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {['Academic', 'Administrative', 'Financial', 'Policy', 'Reports'].map((category) => {
                      const categoryDocs = documents.filter(doc => doc.category === category);
                      return (
                        <Card key={category} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{category}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-center">
                                <div className="text-3xl font-bold">{categoryDocs.length}</div>
                                <p className="text-sm text-muted-foreground">Documents</p>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-lg font-medium">
                                  {categoryDocs.reduce((sum, doc) => sum + doc.downloads, 0)}
                                </div>
                                <p className="text-sm text-muted-foreground">Total Downloads</p>
                              </div>
                              
                              <Button variant="outline" className="w-full">
                                View All
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Upload Form */}
          {showUploadForm && (
            <Card>
              <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter document title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Administrative">Administrative</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Policy">Policy</SelectItem>
                        <SelectItem value="Reports">Reports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button>Upload Document</Button>
                  <Button variant="outline" onClick={() => setShowUploadForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











