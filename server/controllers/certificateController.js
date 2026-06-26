import Certificate from '../models/Certificate.js';

// GET /api/certificates/my
export const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id, isRevoked: false })
      .populate('user', 'name email')
      .populate('event', 'title category startDate endDate banner organizer')
      .sort('-issuedAt');
    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates/verify/:code
export const verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ verificationCode: req.params.code })
      .populate('user', 'name email institution')
      .populate('event', 'title category startDate organizer')
      .populate('registration', 'status');

    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    if (cert.isRevoked) return res.status(400).json({ success: false, valid: false, message: 'Certificate revoked' });

    res.json({ success: true, valid: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates/:id
export const getCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('user', 'name email institution department year')
      .populate('event', 'title category startDate endDate organizer organization');
    if (!cert) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
