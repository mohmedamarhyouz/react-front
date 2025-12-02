using LocalisationApi.Data;
using LocalisationApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<DataStore>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var api = app.MapGroup("/api");

// Auth
api.MapPost("/auth/login", (DataStore db, AuthRequest payload) =>
{
    var user = db.Users.FirstOrDefault(u => u.Email.Equals(payload.Email, StringComparison.OrdinalIgnoreCase));
    if (user == null)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new
    {
        token = "fake-jwt-token",
        role = user.Role,
        user
    });
});

// Reservistes
api.MapGet("/reservistes", (DataStore db) => Results.Ok(db.Reservistes));
api.MapGet("/reservistes/{cin}", (DataStore db, string cin) =>
{
    var reserviste = db.Reservistes.FirstOrDefault(r => r.Cin == cin);
    return reserviste is null ? Results.NotFound() : Results.Ok(reserviste);
});

// Brigades
api.MapGet("/brigades", (DataStore db) => Results.Ok(db.Brigades));

// Campagnes
api.MapGet("/campagnes", (DataStore db) =>
{
    var campagnes = db.Campagnes;
    return Results.Ok(new { items = campagnes, total = campagnes.Count });
});

api.MapGet("/campagnes/{id:int}", (DataStore db, int id) =>
{
    var campagne = db.Campagnes.FirstOrDefault(c => c.Id == id);
    return campagne is null ? Results.NotFound() : Results.Ok(campagne);
});

api.MapPost("/campagnes", (DataStore db, CampagneLocalisation payload) =>
{
    var newId = db.NextId(db.Campagnes.Select(c => c.Id));
    payload.Id = newId;
    db.Campagnes.Add(payload);
    return Results.Created($"/api/campagnes/{payload.Id}", payload);
});

// Dossiers list
api.MapGet("/dossiers", (DataStore db, HttpRequest request) =>
{
    var query = request.Query;
    var dossiers = db.Dossiers.AsEnumerable();

    if (query.TryGetValue("cin", out var cin))
    {
        dossiers = dossiers.Where(d => d.Reserviste?.Cin?.Contains(cin!) == true);
    }
    if (query.TryGetValue("nom", out var nom))
    {
        var n = nom.ToString().ToLowerInvariant();
        dossiers = dossiers.Where(d =>
            d.Reserviste?.Nom?.ToLowerInvariant().Contains(n) == true ||
            d.Reserviste?.Prenom?.ToLowerInvariant().Contains(n) == true);
    }
    if (query.TryGetValue("brigadeId", out var brigadeId) && int.TryParse(brigadeId, out var bid))
    {
        dossiers = dossiers.Where(d => d.Brigade?.Id == bid);
    }
    if (query.TryGetValue("campagneId", out var campagneId) && int.TryParse(campagneId, out var cid))
    {
        dossiers = dossiers.Where(d => d.Campagne?.Id == cid);
    }
    if (query.TryGetValue("statutLocalisation", out var statut))
    {
        dossiers = dossiers.Where(d => d.StatutLocalisation == statut);
    }
    if (query.TryGetValue("typeLocalisation", out var type))
    {
        dossiers = dossiers.Where(d => d.TypeLocalisation == type);
    }

    var list = dossiers.ToList();
    return Results.Ok(new { items = list, total = list.Count });
});

api.MapGet("/dossiers/{id:int}", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    return dossier is null ? Results.NotFound() : Results.Ok(dossier);
});

// Actions helpers
static HistoriqueAction History(string action, string commentaire = "") => new()
{
    Id = (int)DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
    Date = DateTime.UtcNow.ToString("o"),
    Utilisateur = "mock.user",
    Action = action,
    Commentaire = commentaire
};

static void AddHistory(DossierLocalisation dossier, HistoriqueAction history)
{
    dossier.Historique ??= new List<HistoriqueAction>();
    dossier.Historique.Insert(0, history);
    dossier.DateMiseAJour = DateTime.UtcNow.ToString("yyyy-MM-dd");
}

static void AddPv(DossierLocalisation dossier, string type, string motif)
{
    dossier.Pvs ??= new List<PV>();
    var nextId = dossier.Pvs.Any() ? dossier.Pvs.Max(p => p.Id) + 1 : 1;
    dossier.Pvs.Add(new PV
    {
        Id = nextId,
        Numero = $"PV-{DateTime.UtcNow:yyyyMMddHHmmss}",
        Type = type,
        Motif = motif,
        Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
        FichierUrl = "/files/mock.pdf"
    });
}

static void AddBordereau(DossierLocalisation dossier, string type)
{
    dossier.Bordereaux ??= new List<Bordereau>();
    var nextId = dossier.Bordereaux.Any() ? dossier.Bordereaux.Max(p => p.Id) + 1 : 1;
    dossier.Bordereaux.Add(new Bordereau
    {
        Id = nextId,
        Numero = $"BOR-{DateTime.UtcNow:yyyyMMddHHmmss}",
        Type = type,
        Date = DateTime.UtcNow.ToString("yyyy-MM-dd")
    });
}

api.MapPost("/dossiers/{id:int}/confirmer-adresse", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    dossier.StatutLocalisation = "Localise";
    dossier.TypeLocalisation = "Reference";
    AddHistory(dossier, History("Adresse confirmée"));
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/nouvelle-adresse", (DataStore db, int id, NouvelleAdresseRequest payload) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    dossier.StatutLocalisation = "Localise";
    dossier.TypeLocalisation = "NouvelleAdresse";
    if (!string.IsNullOrWhiteSpace(payload.Adresse))
        dossier.AdresseInvestiguer = payload.Adresse!;
    AddHistory(dossier, History(payload.CasParticulier ? "Cas particulier - PV obligatoire" : "Nouvelle adresse", payload.Adresse ?? ""));
    if (payload.CasParticulier) AddPv(dossier, "Autre", "Cas particulier");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/adresse-inconnue", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    dossier.StatutLocalisation = "NonLocalise";
    dossier.TypeLocalisation = "Inconnue";
    AddHistory(dossier, History("Adresse inconnue / PV non-localisation"));
    AddPv(dossier, "NonLocalisation", "Adresse inconnue");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/transfert", (DataStore db, int id, TransfertRequest payload) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    var brigade = db.Brigades.FirstOrDefault(b => b.Id == payload.BrigadeId);
    dossier.StatutLocalisation = "Transfere";
    dossier.TypeLocalisation = "Reference";
    dossier.Brigade = brigade;
    AddHistory(dossier, History("Transfert vers autre brigade", payload.Commentaire ?? ""));
    AddPv(dossier, "Transfert", "Adresse hors zone");
    AddBordereau(dossier, "Transfert");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/marquer-decede", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    dossier.StatutLocalisation = "Localise";
    dossier.TypeLocalisation = "Decede";
    AddHistory(dossier, History("PV Décédé"));
    AddPv(dossier, "Decede", "Décès signalé");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/marquer-ecroue", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    dossier.StatutLocalisation = "Localise";
    dossier.TypeLocalisation = "Ecroue";
    AddHistory(dossier, History("PV Écroué"));
    AddPv(dossier, "Ecroue", "Écroué");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/marquer-etranger", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    dossier.StatutLocalisation = "Localise";
    dossier.TypeLocalisation = "A_Etranger";
    AddHistory(dossier, History("PV Étranger"));
    AddPv(dossier, "A_Etranger", "À l'étranger");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/marquer-inapte", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    dossier.StatutLocalisation = "Localise";
    dossier.TypeLocalisation = "Inapte";
    AddHistory(dossier, History("PV Inapte"));
    AddPv(dossier, "Inapte", "Inapte");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/cas-particulier", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    AddHistory(dossier, History("Cas particulier"));
    AddPv(dossier, "Autre", "Cas particulier");
    return Results.Ok(dossier);
});

api.MapPost("/dossiers/{id:int}/aucune-action", (DataStore db, int id) =>
{
    var dossier = db.FindDossier(id);
    if (dossier is null) return Results.NotFound();
    AddHistory(dossier, History("Aucune action requise"));
    return Results.Ok(dossier);
});

// PV & Bordereaux files
api.MapGet("/pv/{id:int}/fichier", (int id) =>
{
    return Results.File(System.Text.Encoding.UTF8.GetBytes($"Fake PDF contenu pour PV {id}"), "application/pdf");
});
api.MapGet("/bordereaux/{id:int}/fichier", (int id) =>
{
    return Results.File(System.Text.Encoding.UTF8.GetBytes($"Fake PDF contenu pour Bordereau {id}"), "application/pdf");
});

// BR upload & résultats
api.MapPost("/br/upload-fichier", () => Results.Ok(new { message = "Fichier BR reçu (mock)" }));
api.MapGet("/gr/resultats", (DataStore db) =>
{
    var campagnes = db.Campagnes;
    var dossiers = db.Dossiers;
    var aggregats = campagnes.Select(c =>
    {
        var ds = dossiers.Where(d => d.Campagne?.Id == c.Id);
        return new
        {
            campagneId = c.Id,
            campagne = c.Nom,
            total = ds.Count(),
            localises = ds.Count(d => d.StatutLocalisation == "Localise"),
            nonLocalises = ds.Count(d => d.StatutLocalisation == "NonLocalise"),
            transferes = ds.Count(d => d.StatutLocalisation == "Transfere")
        };
    });
    return Results.Ok(aggregats);
});

// Users
api.MapGet("/users", (DataStore db) => Results.Ok(db.Users));
api.MapPost("/users", (DataStore db, UserAccount payload) =>
{
    var newId = db.NextId(db.Users.Select(u => u.Id));
    payload.Id = newId;
    db.Users.Add(payload);
    return Results.Created($"/api/users/{payload.Id}", payload);
});

app.Run();

public record AuthRequest(string Email, string Password);
public record NouvelleAdresseRequest(string? Adresse, bool CasParticulier);
public record TransfertRequest(int BrigadeId, string? Commentaire);
