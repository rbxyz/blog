import { z } from 'zod';
import { prisma } from '../../db';
import { publicProcedure, router } from '../trpc';

export const categoryRouter = router({
  // Query para buscar todas as categorias
  all: publicProcedure.query(async () => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      return categories;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw new Error("Erro ao buscar categorias");
    }
  }),

  // Query para buscar uma categoria específica pelo ID
  byId: publicProcedure.input(z.string()).query(async ({ input }) => {
    const category = await prisma.category.findUnique({
      where: { id: input },
    });
    if (!category) throw new Error("Categoria não encontrada");
    return category;
  }),

  // Mutation para criar uma nova categoria
  create: publicProcedure.input(z.object({
    name: z.string().min(2),
  })).mutation(async ({ input }) => {
    try {
      const newCategory = await prisma.category.create({
        data: {
          name: input.name,
        },
      });
      return newCategory;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw new Error("Erro ao criar categoria");
    }
  }),

  // Mutation para atualizar uma categoria
  update: publicProcedure.input(z.object({
    id: z.string(),
    name: z.string().min(2),
  })).mutation(async ({ input }) => {
    try {
      const updatedCategory = await prisma.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });
      return updatedCategory;
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw new Error("Erro ao atualizar categoria");
    }
  }),

  // Mutation para deletar uma categoria
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const deletedCategory = await prisma.category.delete({
        where: { id: input },
      });
      return deletedCategory;
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      throw new Error("Erro ao deletar categoria");
    }
  }),
});
