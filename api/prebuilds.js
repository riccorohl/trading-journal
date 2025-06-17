// api/prebuilds.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // TODO: Replace with actual logic to fetch user's prebuilds
      const prebuilds = [];
      res.status(200).json(prebuilds);
    } catch (error) {
      console.error('Error fetching prebuilds:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}