export const listTicketsRoute = {
  path: '/tickets',
  method: 'get',
  handler: async (req, res) => {
    res.json({ message: 'works' })
  },
}
