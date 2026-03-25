import Vendor from '../models/Vendor.js';

export const createVendor = async (req, res) => {
  try {
    console.log('🔵 createVendor called');
    console.log('📦 req.body:', JSON.stringify(req.body, null, 2));
    console.log('👤 req.user:', req.user);

    const { name, email, password, phone, address, businessType, participationFee } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await Vendor.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Vendor already exists' });

    const vendor = new Vendor({
      name,
      email,
      passwordHash: password,
      phone,
      address,
      businessType: businessType || 'Other',
      participationFee: participationFee || 0,
    });

    await vendor.save();
    console.log('✅ Vendor saved:', vendor._id);
    res.status(201).json({ message: 'Vendor created', vendor: { id: vendor._id, name, email } });
  } catch (error) {
    console.error('❌ Error in createVendor:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const vendors = await Vendor.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    console.error('❌ Error in getVendors:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('-passwordHash');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    if (req.user.role === 'vendor' && req.user.sub !== vendor._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('❌ Error in getVendorById:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.passwordHash = updateData.password;
      delete updateData.password;
    } else {
      delete updateData.passwordHash;
    }

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
      if (vendor._id.toString() !== req.user.sub) return res.status(403).json({ message: 'Access denied' });
    }

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-passwordHash');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    console.error('❌ Error in updateVendor:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteVendor:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-passwordHash');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    console.error('❌ Error in updateVendorStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateVendorPayment = async (req, res) => {
  try {
    const { paymentStatus, amountPaid } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { paymentStatus, amountPaid }, { new: true }).select('-passwordHash');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    console.error('❌ Error in updateVendorPayment:', error);
    res.status(500).json({ message: error.message });
  }
};