import express from "express";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const prisma = new PrismaClient();

//Read all the data endpoint
app.get("/readorders", async (req, res) => {
  const orders = await prisma.orders.findMany();
  res.json(orders);
});

//The Read a data by ID endpoint
app.get("/readorders/:id", async (req, res) => {
  const id = req.params.id;
  const orders = await prisma.orders.findMany({
    where:{
      orderID: Number(id),
    },

  });
  res.json(orders);
});

//the Update data by ID endpoint 
app.put("/updateorders/:id", async (req, res) => {
  const id = req.params.id;
  const description = req.body.orderDescription;
  const price = req.body.cost;
  const date = req.body.purchaseDate;
  const name = req.body.customerName;
  const orders = await prisma.orders.update(
    {
    where:{
      orderID: Number(id)},
      data: {
        orderDescription: description,
        cost: price,
        purchaseDate: date,
        customerName: name,
      } ,
  });
  res.json(orders);
});

//Delete data by id endpoint 
app.delete("/deleteorders/:id", async (req, res) => {
  const id = req.params.id;
  const orders = await prisma.orders.delete(
    {
    where:{
      orderID: Number(id)},
  });
  res.json(orders);
});


//create data endpoint 
app.post("/createorders/", async (req, res) => {
  const description = req.body.orderDescription;
  const price = req.body.cost;
  const date = req.body.purchaseDate;
  const name = req.body.customerName;
  const orders = await prisma.orders.create(
    {
      data: {
        orderDescription: description,
        cost: price,
        purchaseDate: date,
        customerName: name,
      } ,
  });
  res.json(orders);
});



app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
