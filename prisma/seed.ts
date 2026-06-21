const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando datos existentes...");

  // Delete in reverse dependency order
  await prisma.cashMovement.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.cashSession.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.productionOrderItem.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.business.deleteMany();

  console.log("Datos eliminados. Creando seed...");

  // ── Business ──────────────────────────────────────────────
  const business = await prisma.business.create({
    data: {
      name: "La Milaneseria Demo",
      cuit: "30-12345678-9",
      currency: "ARS",
    },
  });
  console.log("Business creado:", business.name);

  // ── Branch ────────────────────────────────────────────────
  const branch = await prisma.branch.create({
    data: {
      businessId: business.id,
      name: "Casa Central",
      address: "Av. Corrientes 1234, CABA",
    },
  });
  console.log("Branch creada:", branch.name);

  // ── User ──────────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      name: "Admin Demo",
      email: "admin@milanesaos.com",
      role: "admin",
      branchId: branch.id,
    },
  });
  console.log("User creado:", user.name);

  // ── Products ──────────────────────────────────────────────
  const [
    milanesaCarne,
    milanesaPollo,
    milanesaNapo,
    sandwichMila,
    comboFamiliar,
    papasFritas,
    supremaPollo,
    milanesaCongelada,
  ] = await Promise.all([
    prisma.product.create({
      data: {
        name: "Milanesa de carne",
        category: "Milanesas",
        price: 3500,
        cost: 1800,
        type: "manufactured",
        stock: 45,
        unit: "unidad",
      },
    }),
    prisma.product.create({
      data: {
        name: "Milanesa de pollo",
        category: "Milanesas",
        price: 3200,
        cost: 1600,
        type: "manufactured",
        stock: 38,
        unit: "unidad",
      },
    }),
    prisma.product.create({
      data: {
        name: "Milanesa napolitana",
        category: "Milanesas",
        price: 4800,
        cost: 2400,
        type: "manufactured",
        stock: 25,
        unit: "unidad",
      },
    }),
    prisma.product.create({
      data: {
        name: "Sandwich de milanesa completo",
        category: "Sandwiches",
        price: 5500,
        cost: 2800,
        type: "manufactured",
        stock: 0,
        minStock: 0,
        unit: "unidad",
      },
    }),
    prisma.product.create({
      data: {
        name: "Combo familiar (4 milanesas + papas)",
        category: "Combos",
        price: 16000,
        cost: 8500,
        type: "manufactured",
        stock: 0,
        minStock: 0,
        unit: "unidad",
      },
    }),
    prisma.product.create({
      data: {
        name: "Papas fritas",
        category: "Guarniciones",
        price: 2500,
        cost: 900,
        type: "manufactured",
        stock: 30,
        unit: "porcion",
      },
    }),
    prisma.product.create({
      data: {
        name: "Suprema de pollo",
        category: "Milanesas",
        price: 4200,
        cost: 2100,
        type: "manufactured",
        stock: 20,
        unit: "unidad",
      },
    }),
    prisma.product.create({
      data: {
        name: "Milanesa congelada x6",
        category: "Congelados",
        price: 18000,
        cost: 9000,
        type: "manufactured",
        stock: 12,
        unit: "pack",
      },
    }),
  ]);
  console.log("8 productos creados");

  // ── Ingredients ───────────────────────────────────────────
  const [
    carneNalga,
    pollo,
    huevo,
    panRallado,
    mozzarella,
    jamon,
    salsaTomate,
    aceite,
    papa,
    panSandwich,
    packaging,
    bolsa,
  ] = await Promise.all([
    prisma.ingredient.create({
      data: { name: "Carne nalga", unit: "kg", stock: 25, costPerUnit: 8500, minStock: 10 },
    }),
    prisma.ingredient.create({
      data: { name: "Pollo", unit: "kg", stock: 18, costPerUnit: 5200, minStock: 8 },
    }),
    prisma.ingredient.create({
      data: { name: "Huevo", unit: "unidad", stock: 120, costPerUnit: 150, minStock: 60 },
    }),
    prisma.ingredient.create({
      data: { name: "Pan rallado", unit: "kg", stock: 8, costPerUnit: 2800, minStock: 5 },
    }),
    prisma.ingredient.create({
      data: { name: "Mozzarella", unit: "kg", stock: 4, costPerUnit: 9500, minStock: 3 },
    }),
    prisma.ingredient.create({
      data: { name: "Jamon", unit: "kg", stock: 3, costPerUnit: 12000, minStock: 2 },
    }),
    prisma.ingredient.create({
      data: { name: "Salsa de tomate", unit: "litro", stock: 6, costPerUnit: 1800, minStock: 3 },
    }),
    prisma.ingredient.create({
      data: { name: "Aceite", unit: "litro", stock: 15, costPerUnit: 3200, minStock: 5 },
    }),
    prisma.ingredient.create({
      data: { name: "Papa", unit: "kg", stock: 20, costPerUnit: 1500, minStock: 10 },
    }),
    prisma.ingredient.create({
      data: { name: "Pan de sandwich", unit: "unidad", stock: 40, costPerUnit: 800, minStock: 20 },
    }),
    prisma.ingredient.create({
      data: { name: "Packaging", unit: "unidad", stock: 150, costPerUnit: 250, minStock: 50 },
    }),
    prisma.ingredient.create({
      data: { name: "Bolsa", unit: "unidad", stock: 200, costPerUnit: 80, minStock: 100 },
    }),
  ]);
  console.log("12 ingredientes creados");

  // ── Suppliers ─────────────────────────────────────────────
  await Promise.all([
    prisma.supplier.create({
      data: { name: "Frigorifico Norte", contact: "Carlos Mendez", phone: "11-4567-8901" },
    }),
    prisma.supplier.create({
      data: { name: "Distribuidora Lactea Sur", contact: "Laura Vega", phone: "11-3456-7890" },
    }),
    prisma.supplier.create({
      data: { name: "Avicola San Martin", contact: "Roberto Diaz", phone: "11-2345-6789" },
    }),
    prisma.supplier.create({
      data: { name: "Mayorista Packaging Express", contact: "Ana Torres", phone: "11-6789-0123" },
    }),
  ]);
  console.log("4 proveedores creados");

  // ── Customers ─────────────────────────────────────────────
  const [consumidorFinal, juanPerez, mariaGonzalez, oficinaCentro] = await Promise.all([
    prisma.customer.create({
      data: { name: "Consumidor final", type: "final" },
    }),
    prisma.customer.create({
      data: { name: "Juan Perez", phone: "11-1111-2222", type: "final" },
    }),
    prisma.customer.create({
      data: { name: "Maria Gonzalez", phone: "11-3333-4444", email: "maria@gmail.com", type: "final" },
    }),
    prisma.customer.create({
      data: {
        name: "Oficina Centro",
        phone: "11-5555-6666",
        type: "empresa",
        notes: "Pide todos los viernes",
      },
    }),
  ]);
  console.log("4 clientes creados");

  // ── Recipes ───────────────────────────────────────────────
  // 1. Milanesa de carne
  await prisma.recipe.create({
    data: {
      productId: milanesaCarne.id,
      items: {
        create: [
          { ingredientId: carneNalga.id, quantity: 0.25 },
          { ingredientId: huevo.id, quantity: 2 },
          { ingredientId: panRallado.id, quantity: 0.1 },
          { ingredientId: aceite.id, quantity: 0.05 },
          { ingredientId: packaging.id, quantity: 1 },
        ],
      },
    },
  });

  // 2. Milanesa de pollo
  await prisma.recipe.create({
    data: {
      productId: milanesaPollo.id,
      items: {
        create: [
          { ingredientId: pollo.id, quantity: 0.3 },
          { ingredientId: huevo.id, quantity: 2 },
          { ingredientId: panRallado.id, quantity: 0.1 },
          { ingredientId: aceite.id, quantity: 0.05 },
          { ingredientId: packaging.id, quantity: 1 },
        ],
      },
    },
  });

  // 3. Milanesa napolitana
  await prisma.recipe.create({
    data: {
      productId: milanesaNapo.id,
      items: {
        create: [
          { ingredientId: carneNalga.id, quantity: 0.25 },
          { ingredientId: huevo.id, quantity: 2 },
          { ingredientId: panRallado.id, quantity: 0.1 },
          { ingredientId: mozzarella.id, quantity: 0.08 },
          { ingredientId: jamon.id, quantity: 0.05 },
          { ingredientId: salsaTomate.id, quantity: 0.04 },
          { ingredientId: aceite.id, quantity: 0.05 },
          { ingredientId: packaging.id, quantity: 1 },
        ],
      },
    },
  });

  // 4. Sandwich de milanesa
  await prisma.recipe.create({
    data: {
      productId: sandwichMila.id,
      items: {
        create: [
          { ingredientId: carneNalga.id, quantity: 0.25 },
          { ingredientId: huevo.id, quantity: 2 },
          { ingredientId: panRallado.id, quantity: 0.1 },
          { ingredientId: aceite.id, quantity: 0.05 },
          { ingredientId: panSandwich.id, quantity: 1 },
          { ingredientId: packaging.id, quantity: 1 },
        ],
      },
    },
  });

  // 5. Papas fritas
  await prisma.recipe.create({
    data: {
      productId: papasFritas.id,
      items: {
        create: [
          { ingredientId: papa.id, quantity: 0.4 },
          { ingredientId: aceite.id, quantity: 0.1 },
          { ingredientId: packaging.id, quantity: 1 },
        ],
      },
    },
  });

  // 6. Suprema de pollo
  await prisma.recipe.create({
    data: {
      productId: supremaPollo.id,
      items: {
        create: [
          { ingredientId: pollo.id, quantity: 0.35 },
          { ingredientId: huevo.id, quantity: 2 },
          { ingredientId: panRallado.id, quantity: 0.12 },
          { ingredientId: aceite.id, quantity: 0.05 },
          { ingredientId: packaging.id, quantity: 1 },
        ],
      },
    },
  });
  console.log("6 recetas creadas");

  // ── Cash Session (open) ───────────────────────────────────
  const cashSession = await prisma.cashSession.create({
    data: {
      branchId: branch.id,
      openingAmount: 50000,
      status: "open",
    },
  });
  console.log("Sesion de caja abierta con $50.000");

  // ── Sales ─────────────────────────────────────────────────
  const now = new Date();

  // Sale 1: 3 Milanesa de carne + 2 Papas fritas => 3*3500 + 2*2500 = 10500 + 5000 = 15500
  const sale1Total = 3 * 3500 + 2 * 2500; // 15500
  const sale1 = await prisma.sale.create({
    data: {
      branchId: branch.id,
      customerId: juanPerez.id,
      cashSessionId: cashSession.id,
      subtotal: sale1Total,
      discount: 0,
      total: sale1Total,
      paymentMethod: "efectivo",
      status: "completed",
      createdAt: now,
      items: {
        create: [
          {
            productId: milanesaCarne.id,
            quantity: 3,
            unitPrice: 3500,
            subtotal: 3 * 3500,
          },
          {
            productId: papasFritas.id,
            quantity: 2,
            unitPrice: 2500,
            subtotal: 2 * 2500,
          },
        ],
      },
    },
  });

  // Sale 2: 2 Milanesa napolitana + 1 Combo familiar => 2*4800 + 1*16000 = 9600 + 16000 = 25600
  const sale2Total = 2 * 4800 + 1 * 16000; // 25600
  const sale2 = await prisma.sale.create({
    data: {
      branchId: branch.id,
      customerId: oficinaCentro.id,
      cashSessionId: cashSession.id,
      subtotal: sale2Total,
      discount: 0,
      total: sale2Total,
      paymentMethod: "mercadopago",
      status: "completed",
      createdAt: now,
      items: {
        create: [
          {
            productId: milanesaNapo.id,
            quantity: 2,
            unitPrice: 4800,
            subtotal: 2 * 4800,
          },
          {
            productId: comboFamiliar.id,
            quantity: 1,
            unitPrice: 16000,
            subtotal: 16000,
          },
        ],
      },
    },
  });

  // Sale 3: 1 Sandwich de milanesa + 1 Suprema de pollo => 5500 + 4200 = 9700
  const sale3Total = 1 * 5500 + 1 * 4200; // 9700
  const sale3 = await prisma.sale.create({
    data: {
      branchId: branch.id,
      customerId: consumidorFinal.id,
      cashSessionId: cashSession.id,
      subtotal: sale3Total,
      discount: 0,
      total: sale3Total,
      paymentMethod: "debito",
      status: "completed",
      createdAt: now,
      items: {
        create: [
          {
            productId: sandwichMila.id,
            quantity: 1,
            unitPrice: 5500,
            subtotal: 5500,
          },
          {
            productId: supremaPollo.id,
            quantity: 1,
            unitPrice: 4200,
            subtotal: 4200,
          },
        ],
      },
    },
  });
  console.log(`3 ventas creadas. Totales: $${sale1Total} + $${sale2Total} + $${sale3Total} = $${sale1Total + sale2Total + sale3Total}`);

  // ── Stock Movements (for the 3 sales) ────────────────────
  const stockMovements = [
    // Sale 1: 3 Milanesa de carne + 2 Papas fritas
    { itemType: "product", itemId: milanesaCarne.id, type: "sale", quantity: -3, reason: "Venta", reference: sale1.id },
    { itemType: "product", itemId: papasFritas.id, type: "sale", quantity: -2, reason: "Venta", reference: sale1.id },
    // Sale 2: 2 Milanesa napolitana + 1 Combo familiar
    { itemType: "product", itemId: milanesaNapo.id, type: "sale", quantity: -2, reason: "Venta", reference: sale2.id },
    { itemType: "product", itemId: comboFamiliar.id, type: "sale", quantity: -1, reason: "Venta", reference: sale2.id },
    // Sale 3: 1 Sandwich de milanesa + 1 Suprema de pollo
    { itemType: "product", itemId: sandwichMila.id, type: "sale", quantity: -1, reason: "Venta", reference: sale3.id },
    { itemType: "product", itemId: supremaPollo.id, type: "sale", quantity: -1, reason: "Venta", reference: sale3.id },
  ];

  await Promise.all(
    stockMovements.map((sm) =>
      prisma.stockMovement.create({
        data: {
          itemType: sm.itemType,
          itemId: sm.itemId,
          type: sm.type,
          quantity: sm.quantity,
          reason: sm.reason,
          reference: sm.reference,
          createdAt: now,
        },
      })
    )
  );
  console.log("6 movimientos de stock creados");

  // ── Cash Movements (for efectivo sale only) ───────────────
  // Only efectivo payments go into the cash register
  await prisma.cashMovement.create({
    data: {
      cashSessionId: cashSession.id,
      type: "sale",
      amount: sale1Total,
      description: `Venta efectivo - ${sale1.id.slice(-6)}`,
      createdAt: now,
    },
  });
  console.log("1 movimiento de caja creado (venta en efectivo)");

  console.log("\nSeed completado exitosamente!");
  console.log("─────────────────────────────────────────");
  console.log(`  Negocio:      ${business.name}`);
  console.log(`  Sucursal:     ${branch.name}`);
  console.log(`  Usuario:      ${user.email} (${user.role})`);
  console.log(`  Productos:    8`);
  console.log(`  Ingredientes: 12`);
  console.log(`  Recetas:      6`);
  console.log(`  Proveedores:  4`);
  console.log(`  Clientes:     4`);
  console.log(`  Ventas:       3 (total $${sale1Total + sale2Total + sale3Total})`);
  console.log(`  Caja abierta: $50.000`);
  console.log("─────────────────────────────────────────");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
