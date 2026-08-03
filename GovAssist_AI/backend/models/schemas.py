from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


def gen_id() -> str:
    return str(uuid.uuid4())


class UserRole(str, Enum):
    citizen = "citizen"
    admin = "admin"
    officer = "officer"


class Category(str, Enum):
    general = "general"
    obc = "obc"
    sc = "sc"
    st = "st"


class UserCreate(BaseModel):
    clerkId: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: UserRole = UserRole.citizen


class UserUpdate(BaseModel):
    phone: Optional[str] = None
    aadhaar: Optional[str] = None
    address: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    annualIncome: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    community: Optional[str] = None
    emergencyContact: Optional[str] = None
    fullName: Optional[str] = None
    profileCompleted: Optional[bool] = None
    photoUrl: Optional[str] = None


class UserDB(BaseModel):
    id: str = Field(default_factory=gen_id)
    clerkId: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    aadhaar: Optional[str] = None
    address: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[Category] = None
    annualIncome: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    community: Optional[str] = None
    emergencyContact: Optional[str] = None
    fullName: Optional[str] = None
    profileCompleted: bool = False
    photoUrl: Optional[str] = None
    role: UserRole = UserRole.citizen
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class ApplicationStatus(str, Enum):
    draft = "draft"
    submitted = "submitted"
    document_verification = "document_verification"
    eligibility_verification = "eligibility_verification"
    scheme_recommendation = "scheme_recommendation"
    waiting_admin_review = "waiting_admin_review"
    admin_review = "admin_review"
    additional_documents_required = "additional_documents_required"
    documents_required = "documents_required"
    approved = "approved"
    rejected = "rejected"
    under_review = "under_review"
    completed = "completed"


class StageStatus(str, Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    failed = "failed"


class Stage(BaseModel):
    id: str = Field(default_factory=gen_id)
    name: str
    status: StageStatus = StageStatus.pending
    agent: str
    startedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    notes: Optional[str] = None


class WorkflowStage(BaseModel):
    current: str = "submitted"
    stages: List[Stage] = []
    completedAt: Optional[datetime] = None


class TimelineEvent(BaseModel):
    id: str = Field(default_factory=gen_id)
    stage: str
    description: str
    status: str = "completed"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    agent: Optional[str] = None


class EligibilityCriteria(BaseModel):
    name: str
    required: str
    actual: str
    passed: bool


class EligibilityResult(BaseModel):
    isEligible: bool
    score: float
    criteria: List[EligibilityCriteria] = []
    reason: str
    checkedAt: datetime = Field(default_factory=datetime.utcnow)


class Scheme(BaseModel):
    id: str = Field(default_factory=gen_id)
    name: str
    description: str
    ministry: str
    benefits: List[str] = []
    eligibility: List[str] = []
    applicationUrl: Optional[str] = None
    matchScore: float = 0.0
    category: str


class ApplicationCreate(BaseModel):
    serviceType: str
    serviceName: str
    documents: List[str] = []
    formData: Dict[str, Any] = {}


class ApplicationDB(BaseModel):
    id: str = Field(default_factory=gen_id)
    userId: str
    serviceType: str
    serviceName: str
    status: ApplicationStatus = ApplicationStatus.submitted
    priority: str = "medium"
    documents: List[str] = []
    formData: Dict[str, Any] = {}
    eligibilityResult: Optional[EligibilityResult] = None
    recommendations: List[Scheme] = []
    workflowStage: WorkflowStage = Field(default_factory=WorkflowStage)
    department: Optional[str] = None
    assignedOfficer: Optional[str] = None
    timeline: List[TimelineEvent] = []
    estimatedCompletion: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class DocumentType(str, Enum):
    aadhaar = "aadhaar"
    pan = "pan"
    income_certificate = "income_certificate"
    caste_certificate = "caste_certificate"
    birth_certificate = "birth_certificate"
    residence_proof = "residence_proof"
    photo = "photo"
    bank_passbook = "bank_passbook"
    other = "other"


class DocumentDB(BaseModel):
    id: str = Field(default_factory=gen_id)
    userId: str
    applicationId: Optional[str] = None
    name: str
    type: DocumentType = DocumentType.other
    url: str
    cloudinaryId: str = ""
    status: str = "pending"
    ocrData: Dict[str, Any] = {}
    verificationResult: Optional[Dict[str, Any]] = None
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)


class NotificationDB(BaseModel):
    id: str = Field(default_factory=gen_id)
    userId: str
    title: str
    message: str
    type: str = "info"
    read: bool = False
    applicationId: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class AdminPermissions(BaseModel):
    viewCitizens: bool = True
    viewApplications: bool = True
    reviewApplications: bool = True
    approveApplications: bool = True
    rejectApplications: bool = True
    viewAnalytics: bool = True
    viewNotifications: bool = True


class AdminDB(BaseModel):
    id: str = Field(default_factory=gen_id)
    email: str
    password: str
    name: str = "System Administrator"
    role: str = "admin"
    department: str = "System Administration"
    permissions: AdminPermissions = Field(default_factory=AdminPermissions)
    phone: Optional[str] = None
    lastLogin: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class AgentState(BaseModel):
    application_id: str
    user_id: str
    service_type: str
    service_name: str
    documents: List[Dict[str, Any]] = []
    user_data: Dict[str, Any] = {}
    ocr_results: Dict[str, Any] = {}
    form_data: Dict[str, Any] = {}
    verification_result: Dict[str, Any] = {}
    eligibility_result: Dict[str, Any] = {}
    recommendations: List[Dict[str, Any]] = []
    workflow_result: Dict[str, Any] = {}
    notifications: List[Dict[str, Any]] = []
    timeline: List[Dict[str, Any]] = []
    current_stage: str = "citizen_support"
    errors: List[str] = []
    messages: List[Dict[str, Any]] = []
