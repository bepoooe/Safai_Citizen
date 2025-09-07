import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Interface for civilian data structure
export interface CivilianData {
  id?: string;
  imageUrl: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  description: string;
  timestamp: Date;
  status?: 'pending' | 'in_progress' | 'resolved';
}

// Add a new civilian report to Firestore
export const addCivilianReport = async (data: Omit<CivilianData, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'civilian'), {
      ...data,
      timestamp: Timestamp.fromDate(new Date()),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    throw error;
  }
};

// Get all civilian reports
export const getCivilianReports = async (): Promise<CivilianData[]> => {
  try {
    const q = query(collection(db, 'civilian'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const reports: CivilianData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
        reports.push({
          id: doc.id,
          imageUrl: data.imageUrl,
          name: data.name,
          location: data.location,
          description: data.description,
          timestamp: data.timestamp.toDate(),
          status: data.status || 'pending'
        });
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};

// Update a civilian report
export const updateCivilianReport = async (id: string, updates: Partial<CivilianData>): Promise<void> => {
  try {
    const reportRef = doc(db, 'civilian', id);
    await updateDoc(reportRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
    console.log('Document updated successfully');
  } catch (error) {
    console.error('Error updating document: ', error);
    throw error;
  }
};

// Delete a civilian report
export const deleteCivilianReport = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'civilian', id));
    console.log('Document deleted successfully');
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};

// Get civilian reports by status
export const getCivilianReportsByStatus = async (status: 'pending' | 'in_progress' | 'resolved'): Promise<CivilianData[]> => {
  try {
    const q = query(
      collection(db, 'civilian'), 
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reports: CivilianData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === status) {
        reports.push({
          id: doc.id,
          imageUrl: data.imageUrl,
          name: data.name,
          location: data.location,
          description: data.description,
          timestamp: data.timestamp.toDate(),
          status: data.status || 'pending'
        });
      }
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting documents by status: ', error);
    throw error;
  }
};
