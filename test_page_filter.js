const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isAfter, differenceInDays } = require('date-fns');

function evaluateStatus(nextCalDate, calType) {
  if (calType === '免校正') return 'NO_CAL';
  const now = new Date();
  const daysDiff = differenceInDays(nextCalDate, now);
  if (isAfter(now, nextCalDate)) return 'OVERDUE';
  if (daysDiff <= 30) return 'WARNING';
  return 'PASS';
}

async function main() {
  const gages = await prisma.gage.findMany();
  const allGages = gages.map(gage => {
      const nextCal = gage.nextCalDate ? new Date(gage.nextCalDate) : null;
      let isDueThisMonth = false;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      if (nextCal && !isNaN(nextCal.getTime()) && gage.calType !== '免校正') {
        isDueThisMonth = nextCal.getMonth() === currentMonth && nextCal.getFullYear() === currentYear;
      }

      return {
        ...gage,
        calculatedStatus: evaluateStatus(gage.nextCalDate, gage.calType),
        isDueThisMonth,
      };
  });
  
  const statusParam = 'OVERDUE';
  const query = '';
  const location = '';
  const currentCategories = [];
  
  const filteredGages = allGages.filter(gage => {
    const matchesSearch = gage.id.toLowerCase().includes(query.toLowerCase()) || 
                         gage.name.toLowerCase().includes(query.toLowerCase()) ||
                         (gage.usageRange && gage.usageRange.toLowerCase().includes(query.toLowerCase()));
    const matchesLocation = location ? gage.location === location : true;
    const matchesCategory = currentCategories.length > 0 ? currentCategories.includes(gage.category) : true;
    
    let matchesStatus = true;
    if (statusParam === 'OVERDUE') {
      matchesStatus = gage.calculatedStatus === 'OVERDUE';
    } else if (statusParam === 'DUE_THIS_MONTH') {
      matchesStatus = gage.isDueThisMonth;
    }
    
    return matchesSearch && matchesLocation && matchesCategory && matchesStatus;
  });

  console.log('Filtered OVERDUE Gages length:', filteredGages.length);
  if (filteredGages.length > 0) {
    console.log(filteredGages[0].id);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
