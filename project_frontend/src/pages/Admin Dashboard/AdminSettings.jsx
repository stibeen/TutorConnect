import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  PhilippinePeso,
  Mail,
  Save,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminSettings = () => {
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState(null);
  const [loading, setLoading] = useState(false);

  // New expertise form state
  const [newExpertise, setNewExpertise] = useState({
    name: "",
    category: "",
    description: "",
  });

  const [pricingSettings, setPricingSettings] = useState({
    individualSessionPrice: 30.0,
    groupSessionPrice: 15.0,
    currency: "PHP",
    effectiveDate: new Date().toISOString().split("T")[0],
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [academicCalendar, setAcademicCalendar] = useState({
    termStart: new Date().toISOString().split("T")[0],
    termEnd: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 120 days from now
  });
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [signatories, setSignatories] = useState({
    administrator: { name: '', title: 'Administrator' },
    dean: { name: '', title: 'CCIS Dean' }
  });
  const [savingSignatories, setSavingSignatories] = useState(false);

  // Add this function to fetch academic calendar
  const fetchAcademicCalendar = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/academic-calendar`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAcademicCalendar({
        termStart: new Date(response.data.termStart)
          .toISOString()
          .split("T")[0],
        termEnd: new Date(response.data.termEnd).toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error fetching academic calendar:", error);
      toast.error("Failed to load academic calendar");
    }
  };

  // Add this function to save academic calendar
  const handleSaveAcademicCalendar = async () => {
    try {
      setSavingCalendar(true);
      const response = await axios.put(
        `${BASE_URL}/api/academic-calendar`,
        academicCalendar,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Academic calendar updated successfully!");
    } catch (error) {
      console.error("Error saving academic calendar:", error);
      toast.error(
        error.response?.data?.error || "Failed to save academic calendar"
      );
    } finally {
      setSavingCalendar(false);
    }
  };

  const fetchSignatories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/signatories/active`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Transform array to object for easier access with null checks
      const signatoriesObj = {
        administrator: { name: '', title: 'Administrator' },
        dean: { name: '', title: 'CCIS Dean' }
      };

      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(sig => {
          if (sig.role && (sig.role === 'administrator' || sig.role === 'dean')) {
            signatoriesObj[sig.role] = {
              name: sig.name || '',
              title: sig.title || (sig.role === 'administrator' ? 'Administrator' : 'CCIS Dean')
            };
          }
        });
      }

      setSignatories(signatoriesObj);
    } catch (error) {
      console.error("Error fetching signatories:", error);
      // Set default values if API fails
      setSignatories({
        administrator: { name: 'Julie Bitasolo, PhD', title: 'Administrator' },
        dean: { name: 'Shella Olaguir, PhD', title: 'CCIS Dean' }
      });
    }
  };

  // Update handleSaveSignatories function:
  const handleSaveSignatories = async () => {
    try {
      setSavingSignatories(true);

      // Get current values with fallbacks
      const adminName = signatories.administrator?.name || '';
      const adminTitle = signatories.administrator?.title || 'Administrator';
      const deanName = signatories.dean?.name || '';
      const deanTitle = signatories.dean?.title || 'CCIS Dean';

      // Save administrator using role-based endpoint
      await axios.put(`${BASE_URL}/api/signatories/administrator`, {
        name: adminName,
        title: adminTitle
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Save dean using role-based endpoint
      await axios.put(`${BASE_URL}/api/signatories/dean`, {
        name: deanName,
        title: deanTitle
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Signatories updated successfully!");
    } catch (error) {
      console.error("Error saving signatories:", error);
      toast.error(error.response?.data?.message || "Failed to save signatories");
    } finally {
      setSavingSignatories(false);
    }
  };

  // Add to your useEffect
  useEffect(() => {
    fetchExpertiseOptions();
    fetchPricingSettings();
    fetchAcademicCalendar(); // Add this line
    fetchSignatories(); // Add this line
  }, []);

  // Fetch pricing settings
  const fetchPricingSettings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/pricing`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPricingSettings({
        ...response.data,
        effectiveDate: new Date(response.data.effectiveDate)
          .toISOString()
          .split("T")[0],
      });
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
      toast.error("Failed to load pricing settings");
    } finally {
      setLoadingPricing(false);
    }
  };

  // Save pricing settings
  const handleSavePricing = async () => {
    try {
      setSavingPricing(true);
      const response = await axios.put(
        `${BASE_URL}/api/pricing`,
        pricingSettings,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Pricing settings saved successfully!");
    } catch (error) {
      console.error("Error saving pricing settings:", error);
      toast.error("Failed to save pricing settings");
    } finally {
      setSavingPricing(false);
    }
  };

  // Add to your existing useEffect
  useEffect(() => {
    fetchExpertiseOptions();
    fetchPricingSettings(); // Add this line
  }, []);

  // Categories for expertise
  const categories = [
    "Programming",
    "Web Development",
    "Mobile Development",
    "Data Structures",
    "Algorithms",
    "Tools",
    "Other",
  ];

  // Fetch expertise options
  const fetchExpertiseOptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/expertise`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setExpertiseOptions(response.data);
    } catch (error) {
      console.error("Error fetching expertise options:", error);
      toast.error("Failed to load expertise options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertiseOptions();
  }, []);

  // Filter expertise based on search
  const filteredExpertise = expertiseOptions.filter(
    (expertise) =>
      expertise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expertise.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add new expertise
  const handleAddExpertise = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/expertise`,
        newExpertise,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Expertise added successfully");
      setIsAddDialogOpen(false);
      setNewExpertise({ name: "", category: "", description: "" });
      fetchExpertiseOptions();
    } catch (error) {
      console.error("Error adding expertise:", error);
      toast.error(error.response?.data?.message || "Failed to add expertise");
    }
  };

  // Handle edit expertise
  const handleEditExpertise = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/expertise/${selectedExpertise._id}`,
        selectedExpertise,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Expertise updated successfully");
      setIsEditDialogOpen(false);
      setSelectedExpertise(null);
      fetchExpertiseOptions();
    } catch (error) {
      console.error("Error updating expertise:", error);
      toast.error(
        error.response?.data?.message || "Failed to update expertise"
      );
    }
  };

  // Handle delete expertise
  const handleDeleteExpertise = async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/expertise/${selectedExpertise._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Expertise deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedExpertise(null);
      fetchExpertiseOptions();
    } catch (error) {
      console.error("Error deleting expertise:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete expertise"
      );
    }
  };

  // Open edit dialog
  const openEditDialog = (expertise) => {
    setSelectedExpertise({ ...expertise });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (expertise) => {
    setSelectedExpertise(expertise);
    setIsDeleteDialogOpen(true);
  };

  const getCurrencySymbol = () => {
    switch (pricingSettings.currency) {
      case "PHP":
        return "₱";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "₱";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border border-[#3b2762]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card className="border border-[#3b2762]">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage basic platform configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expertise Management Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Expertise Management</h3>
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expertise
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Expertise</DialogTitle>
                        <DialogDescription>
                          Create a new expertise area for tutors to select from.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Expertise Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Python Data Analysis"
                            value={newExpertise.name}
                            onChange={(e) =>
                              setNewExpertise({
                                ...newExpertise,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newExpertise.category}
                            onValueChange={(value) =>
                              setNewExpertise({
                                ...newExpertise,
                                category: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Description (Optional)
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Brief description of this expertise area..."
                            value={newExpertise.description}
                            onChange={(e) =>
                              setNewExpertise({
                                ...newExpertise,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddExpertise}
                          disabled={
                            !newExpertise.name || !newExpertise.category
                          }
                        >
                          Add Expertise
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expertise by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Expertise List */}
                <div className="border rounded-lg">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Loading expertise options...
                    </div>
                  ) : filteredExpertise.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {searchQuery
                        ? "No matching expertise found"
                        : "No expertise options configured yet"}
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {filteredExpertise.map((expertise) => (
                        <div
                          key={expertise._id}
                          className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">
                                {expertise.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {expertise.category}
                              </Badge>
                              {!expertise.isActive && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-50 text-red-700"
                                >
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            {expertise.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {expertise.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(expertise)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(expertise)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Total: {expertiseOptions.length} expertise options • Active:{" "}
                  {expertiseOptions.filter((e) => e.isActive).length} •
                  Inactive: {expertiseOptions.filter((e) => !e.isActive).length}
                </p>
              </div>

              <Separator />
              {/* Academic Calendar Management Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Academic Calendar</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="term-start">Current Term Start Date</Label>
                    <Input
                      id="term-start"
                      type="date"
                      value={academicCalendar.termStart}
                      onChange={(e) =>
                        setAcademicCalendar({
                          ...academicCalendar,
                          termStart: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="term-end">Current Term End Date</Label>
                    <Input
                      id="term-end"
                      type="date"
                      value={academicCalendar.termEnd}
                      onChange={(e) =>
                        setAcademicCalendar({
                          ...academicCalendar,
                          termEnd: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Vacation Mode Warning */}
                {academicCalendar.termEnd &&
                  new Date(academicCalendar.termEnd) < new Date() && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle>Vacation Mode Active</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        The platform is currently in vacation mode. Students
                        will see the vacation page.
                      </AlertDescription>
                    </Alert>
                  )}

                <Button
                  onClick={handleSaveAcademicCalendar}
                  disabled={savingCalendar}
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savingCalendar ? "Saving..." : "Save Academic Calendar"}
                </Button>
              </div>

              <Separator />

              {/* Signatories Management Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Report Signatories</h3>
                <CardDescription>
                  Manage the names that appear on generated reports as signatories.
                </CardDescription>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Administrator Signatory */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-4">Prepared by:</h4>
                      <div className="space-y-3">
                        <div className="grid gap-2">
                          <Label htmlFor="admin-name">Administrator Name</Label>
                          <Input
                            id="admin-name"
                            placeholder="e.g., Julie Bitasolo, PhD"
                            value={signatories.administrator.name}
                            onChange={(e) => setSignatories({
                              ...signatories,
                              administrator: {
                                ...signatories.administrator,
                                name: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="admin-title">Title</Label>
                          <Input
                            id="admin-title"
                            value={signatories.administrator.title}
                            onChange={(e) => setSignatories({
                              ...signatories,
                              administrator: {
                                ...signatories.administrator,
                                title: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dean Signatory */}
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-4">Approved by:</h4>
                      <div className="space-y-3">
                        <div className="grid gap-2">
                          <Label htmlFor="dean-name">Dean Name</Label>
                          <Input
                            id="dean-name"
                            placeholder="e.g., Shella Olaguir, PhD"
                            value={signatories.dean.name}
                            onChange={(e) => setSignatories({
                              ...signatories,
                              dean: {
                                ...signatories.dean,
                                name: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dean-title">Title</Label>
                          <Input
                            id="dean-title"
                            value={signatories.dean.title}
                            onChange={(e) => setSignatories({
                              ...signatories,
                              dean: {
                                ...signatories.dean,
                                title: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Changes will reflect on newly generated reports
                  </div>
                  <Button
                    onClick={handleSaveSignatories}
                    disabled={savingSignatories ||
                      !(signatories.administrator?.name || '').trim() ||
                      !(signatories.dean?.name || '').trim()
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {savingSignatories ? "Saving..." : "Save Signatories"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Expertise Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Expertise</DialogTitle>
                <DialogDescription>
                  Update the expertise details.
                </DialogDescription>
              </DialogHeader>
              {selectedExpertise && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Expertise Name</Label>
                    <Input
                      id="edit-name"
                      value={selectedExpertise.name}
                      onChange={(e) =>
                        setSelectedExpertise({
                          ...selectedExpertise,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={selectedExpertise.category}
                      onValueChange={(value) =>
                        setSelectedExpertise({
                          ...selectedExpertise,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={selectedExpertise.description}
                      onChange={(e) =>
                        setSelectedExpertise({
                          ...selectedExpertise,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-active"
                      checked={selectedExpertise.isActive}
                      onCheckedChange={(checked) =>
                        setSelectedExpertise({
                          ...selectedExpertise,
                          isActive: checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-active">Active</Label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditExpertise}
                  disabled={
                    !selectedExpertise?.name || !selectedExpertise?.category
                  }
                >
                  Update Expertise
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Expertise Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Expertise</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{selectedExpertise?.name}"?
                  This action cannot be undone. Tutors who have selected this
                  expertise will no longer see it as an option.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteExpertise}>
                  Delete Expertise
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="pricing">
          <Card className="border border-[#3b2762]">
            <CardHeader>
              <CardTitle>Pricing Settings</CardTitle>
              <CardDescription>
                Configure session prices for individual and group sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-3 border-[#efc940]">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Price changes will only affect new bookings. Existing bookings
                  will maintain their original rates.
                </AlertDescription>
              </Alert>

              {loadingPricing ? (
                <div className="text-center py-8">
                  Loading pricing settings...
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Session Prices</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="individual-price">
                          Individual Session Price
                        </Label>
                        <div className="relative">
                          <PhilippinePeso className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="individual-price"
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-8"
                            value={pricingSettings.individualSessionPrice}
                            onChange={(e) =>
                              setPricingSettings({
                                ...pricingSettings,
                                individualSessionPrice:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Price for one-on-one tutoring sessions
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="group-price">Group Session Price</Label>
                        <div className="relative">
                          <PhilippinePeso className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="group-price"
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-8"
                            value={pricingSettings.groupSessionPrice}
                            onChange={(e) =>
                              setPricingSettings({
                                ...pricingSettings,
                                groupSessionPrice:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Price per student for group sessions (max 5 students)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">
                          Price Preview
                        </h4>
                        <div className="space-y-2 text-sm text-blue-700">
                          <div className="flex justify-between">
                            <span>Individual Session:</span>
                            <span>
                              {getCurrencySymbol()}
                              {pricingSettings.individualSessionPrice.toFixed(
                                2
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Group Session (per student):</span>
                            <span>
                              {getCurrencySymbol()}
                              {pricingSettings.groupSessionPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Full Group Session (5 students):</span>
                            <span>
                              {getCurrencySymbol()}
                              {(pricingSettings.groupSessionPrice * 5).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="effective-date">
                          Price Change Effective Date
                        </Label>
                        <Input
                          id="effective-date"
                          type="date"
                          value={pricingSettings.effectiveDate}
                          onChange={(e) =>
                            setPricingSettings({
                              ...pricingSettings,
                              effectiveDate: e.target.value,
                            })
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          New prices will apply to bookings made after this date
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePricing} disabled={savingPricing}>
                <Save className="mr-2 h-4 w-4" />
                {savingPricing ? "Saving..." : "Save Pricing"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
