using LocalisationApi.Models;

namespace LocalisationApi.Data;

public class DataStore
{
    public List<Reserviste> Reservistes { get; set; } = new();
    public List<CampagneLocalisation> Campagnes { get; set; } = new();
    public List<Brigade> Brigades { get; set; } = new();
    public List<DossierLocalisation> Dossiers { get; set; } = new();
    public List<UserAccount> Users { get; set; } = new();

    public DataStore()
    {
      Seed();
    }

    private void Seed()
    {
        Reservistes = new List<Reserviste>
        {
            new()
            {
                Cin = "A123456",
                Nom = "El Mansouri",
                Prenom = "Youssef",
                DateNaissance = "1990-02-12",
                AdresseReference = "12 Rue Atlas, Rabat",
                StatutMobilisation = "Active"
            },
            new()
            {
                Cin = "B654321",
                Nom = "Bennani",
                Prenom = "Salma",
                DateNaissance = "1988-07-08",
                AdresseReference = "45 Avenue Hassan II, Casablanca",
                StatutMobilisation = "Expiree"
            }
        };

        Campagnes = new List<CampagneLocalisation>
        {
            new()
            {
                Id = 1,
                Nom = "Campagne 2025 - Lot Nord",
                DateDebut = "2025-01-01",
                DateFin = "2025-03-31",
                Statut = "EnCours"
            },
            new()
            {
                Id = 2,
                Nom = "Campagne 2024 - Sud",
                DateDebut = "2024-04-01",
                DateFin = "2024-06-30",
                Statut = "Terminee"
            }
        };

        Brigades = new List<Brigade>
        {
            new() { Id = 1, Nom = "Brigade Nord", Zone = "Rabat - Salé - Kénitra" },
            new() { Id = 2, Nom = "Brigade Sud", Zone = "Casablanca - Settat" },
            new() { Id = 3, Nom = "Brigade Est", Zone = "Fès - Meknès" }
        };

        Dossiers = new List<DossierLocalisation>
        {
            new()
            {
                Id = 1,
                DateReception = "2025-01-10",
                StatutLocalisation = "EnCours",
                TypeLocalisation = "Reference",
                AdresseInvestiguer = "12 Rue Atlas, Rabat",
                DateMiseAJour = "2025-01-11",
                Reserviste = Reservistes[0],
                Campagne = Campagnes[0],
                Brigade = Brigades[0],
                Pvs = new List<PV>
                {
                    new()
                    {
                        Id = 1,
                        Numero = "PV-2025-001",
                        Type = "Autre",
                        Motif = "Ouverture dossier",
                        Date = "2025-01-10",
                        FichierUrl = "/files/pv-2025-001.pdf"
                    }
                },
                Bordereaux = new List<Bordereau>(),
                Historique = new List<HistoriqueAction>
                {
                    new()
                    {
                        Id = 1,
                        Date = "2025-01-10T10:30:00Z",
                        Utilisateur = "gr.admin",
                        Action = "Création du dossier",
                        Commentaire = "Import initial"
                    }
                }
            },
            new()
            {
                Id = 2,
                DateReception = "2025-01-12",
                StatutLocalisation = "Transfere",
                TypeLocalisation = "NouvelleAdresse",
                AdresseInvestiguer = "Quartier Anfa, Casablanca",
                DateMiseAJour = "2025-01-15",
                Reserviste = Reservistes[1],
                Campagne = Campagnes[0],
                Brigade = Brigades[1],
                Pvs = new List<PV>
                {
                    new()
                    {
                        Id = 2,
                        Numero = "PV-2025-045",
                        Type = "Transfert",
                        Motif = "Adresse hors zone",
                        Date = "2025-01-14",
                        FichierUrl = "/files/pv-2025-045.pdf"
                    }
                },
                Bordereaux = new List<Bordereau>
                {
                    new() { Id = 1, Numero = "BOR-2025-01", Type = "Transfert", Date = "2025-01-14" }
                },
                Historique = new List<HistoriqueAction>
                {
                    new()
                    {
                        Id = 2,
                        Date = "2025-01-12T09:00:00Z",
                        Utilisateur = "gr.admin",
                        Action = "Création du dossier",
                        Commentaire = "Import initial"
                    },
                    new()
                    {
                        Id = 3,
                        Date = "2025-01-14T15:00:00Z",
                        Utilisateur = "brigade.nord",
                        Action = "Transfert vers Brigade Sud",
                        Commentaire = "Adresse hors zone"
                    }
                }
            }
        };

        Users = new List<UserAccount>
        {
            new()
            {
                Id = 1,
                Nom = "Admin GR",
                Email = "gr.admin@example.com",
                Role = "GR",
                DerniereConnexion = "2025-01-10T08:00:00Z",
                MotDePasse = "password"
            },
            new()
            {
                Id = 2,
                Nom = "Chef Brigade Nord",
                Email = "brigade.nord@example.com",
                Role = "Brigade",
                DerniereConnexion = "2025-01-11T09:00:00Z",
                MotDePasse = "password"
            }
        };
    }

    public DossierLocalisation? FindDossier(int id) =>
        Dossiers.FirstOrDefault(d => d.Id == id);

    public int NextId(IEnumerable<int> source)
    {
        var max = source.Any() ? source.Max() : 0;
        return max + 1;
    }
}
